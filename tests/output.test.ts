import { describe, it, expect } from 'vitest';
import { formatOutput, htmlToMarkdown, type OutputFormat } from '../src/lib/output.js';
import type { ExtractionResult } from '../src/lib/extractor.js';

describe('htmlToMarkdown', () => {
  it('should convert basic HTML to markdown', () => {
    const html = '<h1>Hello World</h1>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('# Hello World');
  });

  it('should convert paragraphs', () => {
    const html = '<p>This is a paragraph.</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('This is a paragraph.');
  });

  it('should convert bold and italic', () => {
    const html = '<p><strong>bold</strong> and <em>italic</em></p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('**bold** and _italic_');
  });

  it('should convert links', () => {
    const html = '<a href="https://example.com">Example</a>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('[Example](https://example.com)');
  });

  it('should convert unordered lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const result = htmlToMarkdown(html);
    expect(result).toContain('-');
    expect(result).toContain('Item 1');
    expect(result).toContain('Item 2');
  });

  it('should convert ordered lists', () => {
    const html = '<ol><li>First</li><li>Second</li></ol>';
    const result = htmlToMarkdown(html);
    expect(result).toContain('1.  First');
    expect(result).toContain('2.  Second');
  });

  it('should remove script tags', () => {
    const html = '<div>Content</div><script>alert("bad")</script>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Content');
    expect(result).not.toContain('alert');
    expect(result).not.toContain('script');
  });

  it('should remove style tags', () => {
    const html = '<div>Content</div><style>.class { color: red; }</style>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Content');
    expect(result).not.toContain('color');
    expect(result).not.toContain('style');
  });

  it('should convert code blocks', () => {
    const html = '<pre><code>const x = 1;</code></pre>';
    const result = htmlToMarkdown(html);
    expect(result).toContain('```');
    expect(result).toContain('const x = 1;');
  });

  it('should convert inline code', () => {
    const html = '<p>Use <code>npm install</code> to install.</p>';
    const result = htmlToMarkdown(html);
    expect(result).toContain('`npm install`');
  });

  it('should handle nested elements', () => {
    const html = '<div><h2>Title</h2><p>Paragraph with <a href="#">link</a>.</p></div>';
    const result = htmlToMarkdown(html);
    expect(result).toContain('## Title');
    expect(result).toContain('[link](#)');
  });
});

describe('formatOutput', () => {
  describe('with successful results', () => {
    it('should format single result as text', () => {
      const result: ExtractionResult = {
        success: true,
        data: 'Hello World',
        count: 1,
      };
      const output = formatOutput(result, { format: 'text' });
      expect(output).toBe('Hello World');
    });

    it('should format multiple results as text', () => {
      const result: ExtractionResult = {
        success: true,
        data: ['Item 1', 'Item 2', 'Item 3'],
        count: 3,
      };
      const output = formatOutput(result, { format: 'text' });
      expect(output).toBe('Item 1\n\nItem 2\n\nItem 3');
    });

    it('should format single result as lines', () => {
      const result: ExtractionResult = {
        success: true,
        data: 'Single line',
        count: 1,
      };
      const output = formatOutput(result, { format: 'lines' });
      expect(output).toBe('Single line');
    });

    it('should format multiple results as lines', () => {
      const result: ExtractionResult = {
        success: true,
        data: ['Line 1', 'Line 2', 'Line 3'],
        count: 3,
      };
      const output = formatOutput(result, { format: 'lines' });
      expect(output).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should format result as JSON with pretty print', () => {
      const result: ExtractionResult = {
        success: true,
        data: ['Item 1', 'Item 2'],
        count: 2,
      };
      const output = formatOutput(result, { format: 'json', pretty: true });
      const parsed = JSON.parse(output);
      expect(parsed.data).toEqual(['Item 1', 'Item 2']);
      expect(parsed.count).toBe(2);
      expect(output).toContain('\n'); // Pretty printed
    });

    it('should format result as JSON without pretty print', () => {
      const result: ExtractionResult = {
        success: true,
        data: 'test',
        count: 1,
      };
      const output = formatOutput(result, { format: 'json', pretty: false });
      expect(output).toBe('{"data":"test","count":1}');
    });

    it('should format HTML result as markdown', () => {
      const result: ExtractionResult = {
        success: true,
        data: '<h1>Title</h1><p>Content here.</p>',
        count: 1,
      };
      const output = formatOutput(result, { format: 'markdown' });
      expect(output).toContain('# Title');
      expect(output).toContain('Content here.');
    });

    it('should format multiple HTML results as markdown with separators', () => {
      const result: ExtractionResult = {
        success: true,
        data: ['<h1>First</h1>', '<h1>Second</h1>'],
        count: 2,
      };
      const output = formatOutput(result, { format: 'markdown' });
      expect(output).toContain('# First');
      expect(output).toContain('---');
      expect(output).toContain('# Second');
    });
  });

  describe('with null data', () => {
    it('should return "No results found" message', () => {
      const result: ExtractionResult = {
        success: true,
        data: null,
        count: 0,
      };
      const output = formatOutput(result, { format: 'text' });
      expect(output).toContain('No results found');
    });
  });

  describe('with failed results', () => {
    it('should return error message', () => {
      const result: ExtractionResult = {
        success: false,
        data: null,
        count: 0,
        error: 'Selector not found',
      };
      const output = formatOutput(result, { format: 'text' });
      expect(output).toContain('Error');
      expect(output).toContain('Selector not found');
    });
  });
});
