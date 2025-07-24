const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Test configuration
const TEST_CSS_PATH = path.join(__dirname, 'tests', 'test-css-purge.css');
const CHAT_HISTORY_PATH = path.join(__dirname, 'projects', 'chat-history.md');

// Active class names and DOM tokens that should be preserved
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
  return crypto.createHash('sha256').update(input).digest('hex');
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
  const rules = css.split(/(?=}|@media|@keyframes|@font-face)/g);
  
  const preservedRules = rules.filter(rule => {
    if (!rule.trim()) return false;
    
    // Always preserve @media, @keyframes, @font-face rules
    if (rule.trim().startsWith('@media') || 
        rule.trim().startsWith('@keyframes') || 
        rule.trim().startsWith('@font-face')) {
      return true;
    }
    
    // Check if any active class is used
    for (const className of activeClasses) {
      if (rule.includes(`.${className}`) || 
          rule.includes(`#${className}`)) {
        return true;
      }
    }
    
    return false;
  });
  
  return preservedRules.join('\n').trim();
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

// Log result
function logResult(stats) {
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const logLine = `${timestamp} | ${stats.inputHash} | ${stats.reductionPercentage}% purged | ${stats.originalFormatted}→${stats.purgedFormatted}\n`;
  
  try {
    fs.appendFileSync(CHAT_HISTORY_PATH, logLine);
    console.log(`Logged result to ${CHAT_HISTORY_PATH}`);
  } catch (error) {
    console.error('Error logging result:', error);
  }
}

// Run test
console.log('🚀 Starting CSS Purging Test...\n');

try {
  // Read test CSS file
  if (!fs.existsSync(TEST_CSS_PATH)) {
    throw new Error(`Test CSS file not found: ${TEST_CSS_PATH}`);
  }
  
  const originalCSS = fs.readFileSync(TEST_CSS_PATH, 'utf8');
  const inputHash = calculateHash(originalCSS);
  
  console.log(`📊 Original CSS size: ${formatBytes(getFileSize(originalCSS))}`);
  
  // Run CSS purging
  const purgedCSS = purgeCSS(originalCSS, ACTIVE_CLASSES);
  
  // Calculate compression stats
  const stats = calculateCompression(originalCSS, purgedCSS);
  
  // Add additional metadata
  const fullStats = {
    ...stats,
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    inputHash,
  };
  
  // Log human-readable result
  console.log(`\n✅ CSS purging removed ${stats.reductionPercentage}% of the original CSS`);
  console.log(`   ${stats.originalFormatted} → ${stats.purgedFormatted} (ungzipped)`);
  console.log(`   Removed: ${formatBytes(stats.reduction)}`);
  console.log(`   Classes preserved: ${ACTIVE_CLASSES.length}`);
  
  // Log to file
  logResult(fullStats);
  
  // Save processed CSS for inspection
  const outputPath = path.join(__dirname, 'tests', 'purged-output.css');
  fs.writeFileSync(outputPath, purgedCSS);
  console.log(`\n💾 Purged CSS saved to: ${outputPath}`);
  
  console.log('\n🎉 Test completed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}