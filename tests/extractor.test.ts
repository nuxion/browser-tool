import { describe, it, expect } from 'vitest';
import { extractFromHtml } from '../src/lib/extractor.js';

const sampleHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
</head>
<body>
  <h1>Main Title</h1>
  <div class="content">
    <p class="intro">Introduction paragraph.</p>
    <p class="body">Body paragraph.</p>
  </div>
  <ul class="items">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
  <a href="https://example.com" class="link">Example Link</a>
  <a href="https://test.com" class="link">Test Link</a>
  <img src="/image.png" alt="Test Image" />
  <div id="unique">Unique element</div>
  <div class="nested">
    <span class="inner">Nested content</span>
  </div>
  <div hidden>Hidden content</div>
  <div style="display:none">Also hidden</div>
</body>
</html>
`;

describe('extractFromHtml', () => {
  describe('text extraction', () => {
    it('should extract text from single element by tag', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'h1',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Main Title');
      expect(result.count).toBe(1);
    });

    it('should extract text from element by class', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '.intro',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Introduction paragraph.');
    });

    it('should extract text from element by id', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '#unique',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Unique element');
    });

    it('should extract text from nested element', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '.nested .inner',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Nested content');
    });
  });

  describe('multiple elements', () => {
    it('should extract text from multiple elements', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'li',
        extractionType: 'text',
        multiple: true,
      });
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toEqual(['Item 1', 'Item 2', 'Item 3']);
      expect(result.count).toBe(3);
    });

    it('should extract from multiple elements with same class', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '.link',
        extractionType: 'text',
        multiple: true,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['Example Link', 'Test Link']);
      expect(result.count).toBe(2);
    });

    it('should return only first element when multiple is false', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'li',
        extractionType: 'text',
        multiple: false,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Item 1');
      expect(result.count).toBe(1);
    });
  });

  describe('HTML extraction', () => {
    it('should extract innerHTML from element', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '.nested',
        extractionType: 'html',
      });
      expect(result.success).toBe(true);
      expect(result.data).toContain('<span class="inner">');
      expect(result.data).toContain('Nested content');
    });

    it('should extract innerHTML from multiple elements', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '.content p',
        extractionType: 'html',
        multiple: true,
      });
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.count).toBe(2);
    });
  });

  describe('attribute extraction', () => {
    it('should extract href attribute from link', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'a',
        extractionType: 'attribute',
        attribute: 'href',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('https://example.com');
    });

    it('should extract href from multiple links', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'a',
        extractionType: 'attribute',
        attribute: 'href',
        multiple: true,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['https://example.com', 'https://test.com']);
    });

    it('should extract src attribute from image', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'img',
        extractionType: 'attribute',
        attribute: 'src',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('/image.png');
    });

    it('should extract alt attribute from image', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'img',
        extractionType: 'attribute',
        attribute: 'alt',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Test Image');
    });

    it('should extract class attribute', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '.intro',
        extractionType: 'attribute',
        attribute: 'class',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('intro');
    });

    it('should return null for non-existent attribute', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'h1',
        extractionType: 'attribute',
        attribute: 'data-nonexistent',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.count).toBe(0);
    });
  });

  describe('selector types', () => {
    it('should work with descendant selector', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '.content p',
        extractionType: 'text',
        multiple: true,
      });
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    it('should work with direct child selector', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'body > h1',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Main Title');
    });

    it('should work with attribute selector', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'a[href^="https://example"]',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Example Link');
    });

    it('should return error for XPath selector', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '//h1',
        selectorType: 'xpath',
        extractionType: 'text',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('XPath not supported');
    });
  });

  describe('edge cases', () => {
    it('should return empty array when no elements match (multiple)', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '.nonexistent',
        extractionType: 'text',
        multiple: true,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should return null when no element matches (single)', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: '.nonexistent',
        extractionType: 'text',
        multiple: false,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.count).toBe(0);
    });

    it('should handle empty HTML', () => {
      const result = extractFromHtml('', {
        selector: 'h1',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.count).toBe(0);
    });

    it('should handle malformed HTML', () => {
      const malformed = '<div><p>Unclosed paragraph<div>Another div</div>';
      const result = extractFromHtml(malformed, {
        selector: 'p',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toContain('Unclosed paragraph');
    });

    it('should trim whitespace from text content', () => {
      const html = '<p>   Lots of whitespace   </p>';
      const result = extractFromHtml(html, {
        selector: 'p',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Lots of whitespace');
    });
  });

  describe('complex selectors', () => {
    it('should work with :first-child pseudo-selector', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'li:first-child',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Item 1');
    });

    it('should work with :last-child pseudo-selector', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'li:last-child',
        extractionType: 'text',
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe('Item 3');
    });

    it('should work with multiple selectors (comma)', () => {
      const result = extractFromHtml(sampleHtml, {
        selector: 'h1, .intro',
        extractionType: 'text',
        multiple: true,
      });
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });
  });
});
