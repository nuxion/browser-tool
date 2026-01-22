import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { launchBrowser, navigateTo, type BrowserSession } from '../src/lib/browser.js';
import { extractFromPage } from '../src/lib/extractor.js';
import { formatOutput, htmlToMarkdown } from '../src/lib/output.js';

describe('integration tests', () => {
  let session: BrowserSession;

  beforeAll(async () => {
    session = await launchBrowser({ headless: true });
  });

  afterAll(async () => {
    await session.close();
  });

  describe('full extraction workflow', () => {
    beforeAll(async () => {
      await navigateTo(session.page, 'https://example.com');
    });

    it('should extract and format text as JSON', async () => {
      const result = await extractFromPage(session.page, {
        selector: 'h1',
        extractionType: 'text',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe('Example Domain');

      const output = formatOutput(result, { format: 'json' });
      const parsed = JSON.parse(output);
      expect(parsed.data).toBe('Example Domain');
      expect(parsed.count).toBe(1);
    });

    it('should extract and format multiple elements as lines', async () => {
      const result = await extractFromPage(session.page, {
        selector: 'p',
        extractionType: 'text',
        multiple: true,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      const output = formatOutput(result, { format: 'lines' });
      const lines = output.split('\n');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should extract HTML and convert to markdown', async () => {
      const result = await extractFromPage(session.page, {
        selector: 'body > div',
        extractionType: 'html',
      });

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe('string');

      const output = formatOutput(result, { format: 'markdown' });
      expect(output).toContain('Example Domain');
      // Should not contain raw HTML tags in markdown output
      expect(output).not.toMatch(/<h1>/);
    });

    it('should extract link attributes', async () => {
      const result = await extractFromPage(session.page, {
        selector: 'a',
        extractionType: 'attribute',
        attribute: 'href',
      });

      expect(result.success).toBe(true);
      expect(result.data).toContain('iana.org');
    });

    it('should handle XPath selectors', async () => {
      const result = await extractFromPage(session.page, {
        selector: '//h1',
        selectorType: 'xpath',
        extractionType: 'text',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe('Example Domain');
    });

    it('should handle missing elements gracefully', async () => {
      const result = await extractFromPage(session.page, {
        selector: '.non-existent',
        extractionType: 'text',
        multiple: true, // Use multiple to get empty array instead of waiting
        waitFor: false,
        timeout: 1000,
      });

      // When element doesn't exist with multiple:true, should return empty array
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('markdown conversion workflow', () => {
    it('should convert complex HTML to clean markdown', async () => {
      // Create a page with complex HTML
      await session.page.setContent(`
        <html>
          <body>
            <article>
              <h1>Article Title</h1>
              <p>This is the <strong>introduction</strong> with a <a href="https://example.com">link</a>.</p>
              <h2>Section 1</h2>
              <ul>
                <li>Item one</li>
                <li>Item two</li>
              </ul>
              <pre><code>const x = 1;</code></pre>
              <script>alert('should be removed');</script>
              <style>.hidden { display: none; }</style>
            </article>
          </body>
        </html>
      `);

      const result = await extractFromPage(session.page, {
        selector: 'article',
        extractionType: 'html',
      });

      expect(result.success).toBe(true);

      const markdown = formatOutput(result, { format: 'markdown' });

      // Should have converted headers
      expect(markdown).toContain('# Article Title');
      expect(markdown).toContain('## Section 1');

      // Should have converted formatting
      expect(markdown).toContain('**introduction**');
      expect(markdown).toContain('[link](https://example.com)');

      // Should have converted lists
      expect(markdown).toContain('Item one');
      expect(markdown).toContain('Item two');

      // Should have converted code
      expect(markdown).toContain('const x = 1;');

      // Should NOT contain script content
      expect(markdown).not.toContain('alert');
      expect(markdown).not.toContain('should be removed');

      // Should NOT contain style content
      expect(markdown).not.toContain('display: none');
    });
  });

  describe('viewport and user agent', () => {
    it('should respect viewport settings', async () => {
      const mobileSession = await launchBrowser({
        headless: true,
        viewport: { width: 375, height: 812 },
      });

      try {
        const viewport = mobileSession.page.viewportSize();
        expect(viewport?.width).toBe(375);
        expect(viewport?.height).toBe(812);
      } finally {
        await mobileSession.close();
      }
    });

    it('should respect user agent settings', async () => {
      const customUA = 'Mozilla/5.0 (Custom Browser)';
      const customSession = await launchBrowser({
        headless: true,
        userAgent: customUA,
      });

      try {
        await navigateTo(customSession.page, 'https://example.com');
        const ua = await customSession.page.evaluate(() => navigator.userAgent);
        expect(ua).toBe(customUA);
      } finally {
        await customSession.close();
      }
    });
  });

  describe('wait until options', () => {
    it('should navigate with commit (fastest)', async () => {
      const start = Date.now();
      await navigateTo(session.page, 'https://example.com', {
        waitUntil: 'commit',
      });
      const commitTime = Date.now() - start;

      // Commit should be fast
      expect(commitTime).toBeLessThan(10000);
    });

    it('should navigate with domcontentloaded', async () => {
      await navigateTo(session.page, 'https://example.com', {
        waitUntil: 'domcontentloaded',
      });

      // DOM should be available
      const h1 = await session.page.locator('h1').textContent();
      expect(h1).toBe('Example Domain');
    });

    it('should navigate with load', async () => {
      await navigateTo(session.page, 'https://example.com', {
        waitUntil: 'load',
      });

      // All resources should be loaded
      const content = await session.page.content();
      expect(content).toContain('Example Domain');
    });
  });
});
