const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CSS_PATH = path.join(__dirname, 'tests', 'test-css-purge.css');
const CHAT_HISTORY_PATH = path.join(__dirname, 'projects', 'chat-history.md');

// Active class names that should be preserved
const ACTIVE_CLASSES = [
  'header', 'header-title', 'nav', 'nav-link', 'btn', 'btn-primary', 'btn-secondary',
  'card', 'card-title', 'card-content', 'grid', 'grid-cols-2', 'grid-cols-3',
  'form-group', 'form-label', 'form-input', 'text-center', 'text-left', 'text-right',
  'font-bold', 'font-semibold', 'font-normal', 'text-sm', 'text-base', 'text-lg', 'text-xl',
  'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mb-1', 'mb-2', 'mb-3', 'mb-4',
  'p-1', 'p-2', 'p-3', 'p-4', 'responsive-grid', 'mobile-hidden', 'desktop-only'
];

// Ensure projects directory exists
if (!fs.existsSync(path.dirname(CHAT_HISTORY_PATH))) {
  fs.mkdirSync(path.dirname(CHAT_HISTORY_PATH), { recursive: true });
}

// Calculate SHA256 hash
function calculateHash(input) {
  return require('crypto').createHash('sha256').update(input).digest('hex');
}

// Get file size
function getFileSize(content) {
  return Buffer.byteLength(content, 'utf8');
}

// Format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Simple CSS purging
function purgeCSS(css, activeClasses) {
  const activeSet = new Set(activeClasses);
  const lines = css.split('\n');
  const preservedLines = [];
  
  let currentRule = '';
  let shouldPreserve = false;
  
  for (const line of lines) {
    currentRule += line + '\n';
    
    // Check if this line ends a rule
    if (line.trim() === '}' || line.includes('@media') || line.includes('@keyframes')) {
      // Check if rule should be preserved
      for (const className of activeClasses) {
        if (currentRule.includes(`.${className}`)) {
          shouldPreserve = true;
          break;
        }
      }
      
      // Always preserve @media, @keyframes, @font-face rules
      if (currentRule.includes('@media') || currentRule.includes('@keyframes') || currentRule.includes('@font-face')) {
        shouldPreserve = true;
      }
      
      if (shouldPreserve) {
        preservedLines.push(currentRule.trim());
      }
      
      currentRule = '';
      shouldPreserve = false;
    }
  }
  
  return preservedLines.join('\n\n');
}

// Calculate compression
function calculateCompression(original, purged) {
  const originalSize = getFileSize(original);
  const purgedSize = getFileSize(purged);
  const reduction = originalSize - purgedSize;
  const reductionPercentage = ((reduction / originalSize) * 100).toFixed(2);
  
  return {
    originalSize,
    purgedSize,
    reduction,
    reductionPercentage,
    originalFormatted: formatBytes(originalSize),
    purgedFormatted: formatBytes(purgedSize),
  };
}

// Run test
console.log('CSS Purging Test Results');
console.log('========================');

try {
  // Read test CSS file
  const originalCSS = fs.readFileSync(TEST_CSS_PATH, 'utf8');
  const inputHash = calculateHash(originalCSS);
  
  console.log(`Original CSS size: ${formatBytes(getFileSize(originalCSS))}`);
  
  // Run CSS purging
  const purgedCSS = purgeCSS(originalCSS, ACTIVE_CLASSES);
  
  // Calculate compression stats
  const stats = calculateCompression(originalCSS, purgedCSS);
  
  // Log results
  console.log(`\nResults:`);
  console.log(`- CSS purging removed ${stats.reductionPercentage}% of the original CSS`);
  console.log(`- Size reduction: ${stats.originalFormatted} → ${stats.purgedFormatted}`);
  console.log(`- Removed: ${formatBytes(stats.reduction)}`);
  console.log(`- Classes preserved: ${ACTIVE_CLASSES.length}`);
  
  // Log to file
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const logLine = `${timestamp} | ${inputHash} | ${stats.reductionPercentage}% purged | ${stats.originalFormatted}→${stats.purgedFormatted}\n`;
  fs.appendFileSync(CHAT_HISTORY_PATH, logLine);
  
  // Save processed CSS
  const outputPath = path.join(__dirname, 'tests', 'purged-output.css');
  fs.writeFileSync(outputPath, purgedCSS);
  
  console.log(`\nTest completed successfully!`);
  console.log(`Results logged to: ${CHAT_HISTORY_PATH}`);
  console.log(`Purged CSS saved to: ${outputPath}`);
  
} catch (error) {
  console.error('Test failed:', error.message);
}