import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Test configuration
const TEST_CSS_PATH = path.join(__dirname, 'test-css-purge.css');
const CHAT_HISTORY_PATH = path.join(process.cwd(), 'projects', 'chat-history.md');

// Active class names and DOM tokens that should be preserved
const ACTIVE_CLASSES = [
  'header', 'header-title', 'nav', 'nav-link', 'btn', 'btn-primary', 'btn-secondary',
  'card', 'card-title', 'card-content', 'grid', 'grid-cols-2', 'grid-cols-3',
  'form-group', 'form-label', 'form-input', 'text-center', 'text-left', 'text-right',
  'font-bold', 'font-semibold', 'font-normal', 'text-sm', 'text-base', 'text-lg', 'text-xl',
  'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mb-1', 'mb-2', 'mb-3', 'mb-4',
  'p-1', 'p-2', 'p-3', 'p-4', 'responsive-grid', 'mobile-hidden', 'desktop-only'
];

// Mock fs for testing
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    appendFileSync: vi.fn(),
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

// Mock console for testing
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('CSS Purging Tests', () => {
  let mockFs;

  beforeAll(() => {
    mockFs = vi.mocked(fs);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('Utility Functions', () => {
    it('should calculate SHA256 hash correctly', () => {
      const input = 'test-string';
      const hash = crypto.createHash('sha256').update(input).digest('hex');
      expect(hash).toHaveLength(64);
      expect(typeof hash).toBe('string');
    });

    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    it('should get file size correctly', () => {
      expect(getFileSize('hello')).toBe(5);
      expect(getFileSize('')).toBe(0);
    });
  });

  describe('CSS Purging Function', () => {
    it('should preserve active classes', () => {
      const css = '.header { color: red; } .unused { color: blue; }';
      const result = purgeCSS(css, ['header']);
      
      expect(result).toContain('.header');
      expect(result).not.toContain('.unused');
    });

    it('should handle empty CSS', () => {
      const result = purgeCSS('', ACTIVE_CLASSES);
      expect(result).toBe('');
    });

    it('should preserve @media queries with active classes', () => {
      const css = '@media (max-width: 768px) { .header { color: red; } } .unused { color: blue; }';
      const result = purgeCSS(css, ['header']);
      
      expect(result).toContain('@media');
      expect(result).toContain('.header');
      expect(result).not.toContain('.unused');
    });
  });

  describe('Compression Calculation', () => {
    it('should calculate compression stats correctly', () => {
      const original = 'body { color: red; } .header { color: blue; }';
      const purged = 'body { color: red; }';
      
      const stats = calculateCompression(original, purged);
      
      expect(stats.originalSize).toBeGreaterThan(stats.purgedSize);
      expect(stats.reductionPercentage).toBeGreaterThan('0');
      expect(stats.originalFormatted).toMatch(/\d+(\.\d+)? [BKMG]/);
    });
  });

  describe('Integration Tests', () => {
    it('should handle file operations correctly', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('.header { color: red; } .unused { color: blue; }');
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.appendFileSync.mockImplementation(() => {});

      const result = runPurgeTest();
      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.originalCSS).toBeDefined();
      expect(result.purgedCSS).toBeDefined();
    });

    it('should handle missing CSS file', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = runPurgeTest();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Test CSS file not found');
    });
  });
});

// Utility functions
export function calculateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function getFileSize(content) {
  return Buffer.byteLength(content, 'utf8');
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function purgeCSS(css, activeClasses) {
  const activeSet = new Set(activeClasses);
  
  // Split CSS into rules
  const rules = css.split(/(?=}|@media|@keyframes|@font-face)/g);
  
  const preservedRules = rules.filter(rule => {
    // Skip empty rules
    if (!rule.trim()) return false;
    
    // Always preserve @media, @keyframes, @font-face rules
    if (rule.trim().startsWith('@media') || 
        rule.trim().startsWith('@keyframes') || 
        rule.trim().startsWith('@font-face')) {
      return true;
    }
    
    // Check if any active class is used in this rule
    for (const className of activeClasses) {
      if (rule.includes(`.${className}`) || 
          rule.includes(`#${className}`) || 
          rule.includes(`[class*="${className}"]`)) {
        return true;
      }
    }
    
    return false;
  });
  
  return preservedRules.join('\n').trim();
}

export function calculateCompression(original, purged) {
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

export function logResult(stats) {
  const logLine = `${stats.timestamp} | ${stats.inputHash} | ${stats.reductionPercentage}% purged | ${stats.originalFormatted}→${stats.purgedFormatted}\n`;
  
  try {
    fs.appendFileSync(CHAT_HISTORY_PATH, logLine);
    console.log(`Logged result to ${CHAT_HISTORY_PATH}`);
  } catch (error) {
    console.error('Error logging result:', error);
  }
}

export function runPurgeTest() {
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
    const outputPath = path.join(__dirname, 'purged-output.css');
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