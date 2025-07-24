const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const TEST_CSS_PATH = path.join(__dirname, 'tests', 'test-css-purge.css');
const CHAT_HISTORY_PATH = path.join(__dirname, 'projects', 'chat-history.md');
const OUTPUT_PATH = path.join(__dirname, 'tests', 'purged-output.css');

// Active classes to preserve
const ACTIVE_CLASSES = [
  'header', 'header-title', 'nav', 'nav-link', 'btn', 'btn-primary', 'btn-secondary',
  'card', 'card-title', 'card-content', 'grid', 'grid-cols-2', 'grid-cols-3',
  'form-group', 'form-label', 'form-input', 'text-center', 'text-left', 'text-right',
  'font-bold', 'font-semibold', 'font-normal', 'text-sm', 'text-base', 'text-lg', 'text-xl',
  'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mb-1', 'mb-2', 'mb-3', 'mb-4',
  'p-1', 'p-2', 'p-3', 'p-4', 'responsive-grid', 'mobile-hidden', 'desktop-only'
];

// Utility functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

// CSS purging function
function purgeCSS(css, activeClasses) {
  const activeSet = new Set(activeClasses);
  const lines = css.split('\n');
  const preservedLines = [];
  let currentRule = '';
  let shouldPreserve = false;
  let inMediaQuery = false;
  let mediaQueryBuffer = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle media queries and other at-rules
    if (line.trim().startsWith('@media') || line.trim().startsWith('@keyframes') || line.trim().startsWith('@font-face')) {
      if (inMediaQuery) {
        preservedLines.push(currentRule);
      }
      inMediaQuery = true;
      mediaQueryBuffer = line + '\n';
      currentRule = '';
      shouldPreserve = false;
      continue;
    }
    
    if (inMediaQuery) {
      mediaQueryBuffer += line + '\n';
      if (line.trim() === '}') {
        // Check if this media query contains any active classes
        let hasActiveClass = false;
        for (const className of activeClasses) {
          if (mediaQueryBuffer.includes(`.${className}`)) {
            hasActiveClass = true;
            break;
          }
        }
        
        if (hasActiveClass || mediaQueryBuffer.includes('.responsive-grid') || 
            mediaQueryBuffer.includes('.mobile-hidden') || mediaQueryBuffer.includes('.desktop-only')) {
          preservedLines.push(mediaQueryBuffer.trim());
        }
        
        inMediaQuery = false;
        mediaQueryBuffer = '';
        currentRule = '';
        shouldPreserve = false;
      }
      continue;
    }
    
    // Handle regular CSS rules
    if (!inMediaQuery) {
      currentRule += line + '\n';
      
      if (line.trim() === '}') {
        // Check if this rule should be preserved
        for (const className of activeClasses) {
          if (currentRule.includes(`.${className}`)) {
            shouldPreserve = true;
            break;
          }
        }
        
        if (shouldPreserve) {
          preservedLines.push(currentRule.trim());
        }
        
        currentRule = '';
        shouldPreserve = false;
      }
    }
  }
  
  return preservedLines.join('\n\n');
}

// Main test execution
console.log('=== CSS Purging Test ===\n');

try {
  // Ensure directories exist
  if (!fs.existsSync(path.dirname(CHAT_HISTORY_PATH))) {
    fs.mkdirSync(path.dirname(CHAT_HISTORY_PATH), { recursive: true });
  }
  
  // Read CSS file
  const originalCSS = fs.readFileSync(TEST_CSS_PATH, 'utf8');
  const originalSize = Buffer.byteLength(originalCSS, 'utf8');
  const inputHash = calculateHash(originalCSS);
  
  console.log(`Original CSS: ${formatBytes(originalSize)}`);
  console.log(`Input hash: ${inputHash}`);
  
  // Run purging
  const purgedCSS = purgeCSS(originalCSS, ACTIVE_CLASSES);
  const purgedSize = Buffer.byteLength(purgedCSS, 'utf8');
  
  // Calculate statistics
  const reduction = originalSize - purgedSize;
  const reductionPercentage = ((reduction / originalSize) * 100).toFixed(2);
  
  console.log(`\nResults:`);
  console.log(`- Purged CSS: ${formatBytes(purgedSize)}`);
  console.log(`- Reduction: ${formatBytes(reduction)} (${reductionPercentage}%)`);
  console.log(`- Classes preserved: ${ACTIVE_CLASSES.length}`);
  
  // Save results
  fs.writeFileSync(OUTPUT_PATH, purgedCSS);
  
  // Log to chat history
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const logEntry = `${timestamp} | ${inputHash} | ${reductionPercentage}% | ${formatBytes(originalSize)}→${formatBytes(purgedSize)}\n`;
  
  fs.appendFileSync(CHAT_HISTORY_PATH, logEntry);
  
  console.log(`\n✅ Test completed!`);
  console.log(`📁 Purged CSS saved to: ${OUTPUT_PATH}`);
  console.log(`📊 Results logged to: ${CHAT_HISTORY_PATH}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
}