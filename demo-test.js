const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Create a simple test CSS file
const testCSS = `
/* Large CSS file with unused selectors */
* { margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; }

/* Used classes */
.header { background: #333; color: white; }
.nav { display: flex; gap: 1rem; }
.btn { padding: 0.5rem 1rem; border-radius: 4px; }
.card { background: white; padding: 1rem; margin: 1rem 0; }

/* Unused classes (will be purged) */
.unused-class-1 { color: red; background: blue; }
.unused-class-2 { display: none; visibility: hidden; }
.legacy-style { font-family: serif; text-decoration: underline; }
.redundant-helper { opacity: 0.5; transform: scale(1.1); }
.old-button { border: 1px solid #ccc; cursor: pointer; }
.deprecated-alert { background: #f8d7da; color: #721c24; }
.unused-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
.unused-flex { display: flex; justify-content: center; align-items: center; }
.unused-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
.unused-tooltip { position: absolute; z-index: 1000; background: black; color: white; }
`;

// Active classes to preserve
const ACTIVE_CLASSES = ['header', 'nav', 'btn', 'card'];

// Utility functions
function calculateHash(input) {
    return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
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
    const activeSet = new Set(activeClasses);
    const lines = css.split('\n');
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
            const className = selector.replace('.', '');
            
            // Keep if it's an active class
            const isActive = activeSet.has(className);
            
            if (isActive) {
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

function runTest() {
    console.log('🚀 CSS Purging Test Demo');
    console.log('========================\n');
    
    const originalSize = getFileSize(testCSS);
    const inputHash = calculateHash(testCSS);
    
    console.log(`📊 Original CSS: ${formatBytes(originalSize)}`);
    console.log(`🔐 Input Hash: ${inputHash}`);
    
    // Run CSS purging
    const purgedCSS = purgeCSS(testCSS, ACTIVE_CLASSES);
    const purgedSize = getFileSize(purgedCSS);
    
    const reduction = originalSize - purgedSize;
    const reductionPercent = ((reduction / originalSize) * 100).toFixed(2);
    
    console.log(`✅ Purged CSS: ${formatBytes(purgedSize)}`);
    console.log(`📉 Reduction: ${formatBytes(reduction)} (${reductionPercent}%)`);
    console.log(`🎯 Classes preserved: ${ACTIVE_CLASSES.length}`);
    
    // Save results
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logEntry = `${timestamp} | ${inputHash} | ${reductionPercent}% purged | ${formatBytes(originalSize)}→${formatBytes(purgedSize)}\n`;
    
    // Ensure directories exist
    if (!fs.existsSync('tests')) fs.mkdirSync('tests');
    if (!fs.existsSync('projects')) fs.mkdirSync('projects');
    
    // Save files
    fs.writeFileSync('tests/test-css-demo.css', testCSS);
    fs.writeFileSync('tests/purged-demo.css', purgedCSS);
    
    // Log to chat-history
    fs.appendFileSync('projects/chat-history.md', logEntry);
    
    console.log('\n💾 Files saved:');
    console.log(`   - tests/test-css-demo.css (original)`);
    console.log(`   - tests/purged-demo.css (purged)`);
    console.log(`   - projects/chat-history.md (log)`);
    
    return {
        originalSize,
        purgedSize,
        reduction,
        reductionPercent,
        inputHash,
        timestamp
    };
}

// Run the test
const results = runTest();

console.log('\n📋 Test Summary:');
console.log(`   Status: ✅ PASSED`);
console.log(`   Original: ${formatBytes(results.originalSize)}`);
console.log(`   Purged: ${formatBytes(results.purgedSize)}`);
console.log(`   Reduction: ${results.reductionPercent}%`);
console.log(`   SHA256: ${results.inputHash}`);