// Simple test runner
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Running CSS Purge Test...');

const testPath = path.join(__dirname, 'tests', 'css-purge-test.js');

try {
  // Run the test directly
  require(testPath);
  console.log('✅ Test completed successfully!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}