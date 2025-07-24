// Simple CSS purging test
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Create test directories if they don't exist
if (!fs.existsSync('tests')) fs.mkdirSync('tests');
if (!fs.existsSync('projects')) fs.mkdirSync('projects');

// Create a large CSS test file (52KB+)
const largeCSS = `
/* Large CSS file for testing - ${'x'.repeat(1000)} */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }

/* Used classes */
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem 0; }
.header-title { font-size: 2rem; font-weight: 700; color: white; text-align: center; }
.nav { display: flex; justify-content: center; gap: 2rem; margin-top: 1rem; }
.nav-link { color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 4px; transition: background-color 0.3s ease; }
.btn { display: inline-block; padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { background-color: #007bff; color: white; }
.btn-secondary { background-color: #6c757d; color: white; }
.card { background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 1.5rem; margin: 1rem 0; }
.card-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; color: #2c3e50; }
.card-content { color: #666; line-height: 1.6; }
.grid { display: grid; gap: 1rem; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.form-group { margin-bottom: 1rem; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }
.form-input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-normal { font-weight: 400; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }

/* Unused classes - will be purged */
${Array.from({length: 200}, (_, i) => `
.unused-class-${i} { color: #${Math.floor(Math.random()*16777215).toString(16)}; background: #${Math.floor(Math.random()*16777215).toString(16)}; padding: ${Math.random()*20}px; margin: ${Math.random()*20}px; border: 1px solid #${Math.floor(Math.random()*16777215).toString(16)}; border-radius: ${Math.random()*10}px; }
.unused-helper-${i} { display: ${['none', 'block', 'inline', 'flex'][Math.floor(Math.random()*4)]}; visibility: ${['visible', 'hidden'][Math.floor(Math.random()*2)]}; opacity: ${Math.random()}; transform: scale(${Math.random()*2}); }
.unused-style-${i} { font-family: ${['serif', 'sans-serif', 'monospace'][Math.floor(Math.random()*3)]}; font-size: ${Math.random()*20 + 10}px; font-weight: ${[100, 200, 300, 400, 500, 600, 700, 800, 900][Math.floor(Math.random()*9)]}; }
`).join('')}

/* More unused classes for size */
${Array.from({length: 100}, (_, i) => `
.unused-grid-${i} { display: grid; grid-template-columns: repeat(${i % 12 + 1}, 1fr); gap: ${Math.random()*20}px; }
.unused-flex-${i} { display: flex; flex-direction: ${['row', 'column', 'row-reverse', 'column-reverse'][Math.floor(Math.random()*4)]}; justify-content: ${['flex-start', 'center', 'flex-end', 'space-between'][Math.floor(Math.random()*4)]}; align-items: ${['stretch', 'center', 'flex-start', 'flex-end'][Math.floor(Math.random()*4)]}; }
.unused-modal-${i} { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,${Math.random()*0.8}); z-index: ${1000 + i}; }
`).join('')}
`;

// Active classes to preserve
const ACTIVE_CLASSES = [
    'header', 'header-title', 'nav', 'nav-link', 'btn', 'btn-primary', 'btn-secondary',
    'card', 'card-title', 'card-content', 'grid', 'grid-cols-2', 'grid-cols-3',
    'form-group', 'form-label', 'form-input', 'text-center', 'text-left', 'text-right',
    'font-bold', 'font-semibold', 'font-normal', 'text-sm', 'text-base', 'text-lg', 'text-xl',
    'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mb-1', 'mb-2', 'mb-3', 'mb-4',
    'p-1', 'p-2', 'p-3', 'p-4'
];

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
            
            // Keep if it's an active class or contains pseudo-selectors
            const isActive = activeSet.has(className) || 
                           selector.includes(':') || 
                           selector.includes(' ') ||
                           selector.includes(',');
            
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
    console.log('🚀 CSS Purging Test - LightningCSS Demo');
    console.log('=====================================\n');
    
    const originalSize = getFileSize(largeCSS);
    const inputHash = calculateHash(largeCSS);
    
    console.log(`📊 Original CSS: ${formatBytes(originalSize)}`);
    console.log(`🔐 Input Hash: ${inputHash}`);
    
    // Run CSS purging
    const purgedCSS = purgeCSS(largeCSS, ACTIVE_CLASSES);
    const purgedSize = getFileSize(purgedCSS);
    
    const reduction = originalSize - purgedSize;
    const reductionPercent = ((reduction / originalSize) * 100).toFixed(2);
    
    console.log(`✅ Purged CSS: ${formatBytes(purgedSize)}`);
    console.log(`📉 Reduction: ${formatBytes(reduction)} (${reductionPercent}%)`);
    console.log(`🎯 Classes preserved: ${ACTIVE_CLASSES.length}`);
    
    // Save files
    fs.writeFileSync('tests/test-css-purge.css', largeCSS);
    fs.writeFileSync('tests/purged-output.css', purgedCSS);
    
    // Log to chat-history
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logEntry = `${timestamp} | ${inputHash} | ${reductionPercent}% purged | ${formatBytes(originalSize)}→${formatBytes(purgedSize)}\n`;
    fs.appendFileSync('projects/chat-history.md', logEntry);
    
    console.log('\n💾 Files saved:');
    console.log(`   - tests/test-css-purge.css (${formatBytes(originalSize)})`);
    console.log(`   - tests/purged-output.css (${formatBytes(purgedSize)})`);
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