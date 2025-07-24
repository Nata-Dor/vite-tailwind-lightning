const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Utility functions
function calculateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getFileSize(content) {
  return Buffer.byteLength(content, 'utf8');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function purgeCSS(css, activeClasses) {
  // Simple CSS purging - remove unused selectors
  const lines = css.split('\n');
  const activeSelectors = new Set(activeClasses);
  const purgedLines = [];
  let skipBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comments and empty lines
    if (line.startsWith('/*') || line === '') {
      purgedLines.push(lines[i]);
      continue;
    }
    
    // Check if this is a selector line
    if (line.includes('{') && !line.startsWith('@')) {
      const selector = line.split('{')[0].trim();
      const isActive = activeSelectors.has(selector.replace('.', ''));
      
      if (isActive || selector.includes(':') || selector.includes(' ')) {
        skipBlock = false;
        purgedLines.push(lines[i]);
      } else {
        skipBlock = true;
      }
    } else if (line === '}') {
      if (!skipBlock) {
        purgedLines.push(lines[i]);
      }
      skipBlock = false;
    } else if (!skipBlock) {
      purgedLines.push(lines[i]);
    }
  }
  
  return purgedLines.join('\n');
}

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

function logResult(stats) {
  const logLine = `${stats.timestamp} | ${stats.inputHash} | ${stats.reductionPercentage}% purged | ${stats.originalFormatted}→${stats.purgedFormatted}\n`;
  
  try {
    // Ensure projects directory exists
    if (!fs.existsSync(path.dirname(CHAT_HISTORY_PATH))) {
      fs.mkdirSync(path.dirname(CHAT_HISTORY_PATH), { recursive: true });
    }
    
    fs.appendFileSync(CHAT_HISTORY_PATH, logLine);
    console.log(`✅ Logged result to ${CHAT_HISTORY_PATH}`);
  } catch (error) {
    console.error('❌ Error logging result:', error.message);
  }
}

function runTest() {
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
      timestamp: getCurrentTimestamp(),
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
    
    // Return comprehensive results
    return {
      success: true,
      stats: fullStats,
      originalCSS,
      purgedCSS,
      activeClasses: ACTIVE_CLASSES,
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test
const result = runTest();
console.log('\n📋 Test Summary:', result.success ? 'PASSED' : 'FAILED');

if (result.success) {
  console.log('\n📊 Detailed Stats:');
  console.log(`   Original: ${result.stats.originalFormatted}`);
  console.log(`   Purged: ${result.stats.purgedFormatted}`);
  console.log(`   Reduction: ${result.stats.reductionPercentage}%`);
  console.log(`   SHA256: ${result.stats.inputHash}`);
}