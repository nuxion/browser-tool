import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { launchBrowser, navigateTo, type BrowserSession } from '../src/lib/browser.js';

describe('browser module', () => {
  describe('launchBrowser', () => {
    let session: BrowserSession | null = null;

    afterAll(async () => {
      if (session) {
        await session.close();
      }
    });

    it('should launch browser with default options', async () => {
      session = await launchBrowser();

      expect(session).toBeDefined();
      expect(session.browser).toBeDefined();
      expect(session.context).toBeDefined();
      expect(session.page).toBeDefined();
      expect(typeof session.close).toBe('function');
    });

    it('should launch browser in headless mode by default', async () => {
      session = await launchBrowser();

      // Browser should be connected
      expect(session.browser.isConnected()).toBe(true);
    });

    it('should launch browser with custom viewport', async () => {
      session = await launchBrowser({
        viewport: { width: 1920, height: 1080 },
      });

      const viewport = session.page.viewportSize();
      expect(viewport?.width).toBe(1920);
      expect(viewport?.height).toBe(1080);
    });

    it('should launch browser with custom user agent', async () => {
      const customUserAgent = 'CustomBot/1.0';
      session = await launchBrowser({
        userAgent: customUserAgent,
      });

      const userAgent = await session.page.evaluate(() => navigator.userAgent);
      expect(userAgent).toBe(customUserAgent);
    });

    it('should close browser properly', async () => {
      session = await launchBrowser();
      expect(session.browser.isConnected()).toBe(true);

      await session.close();
      expect(session.browser.isConnected()).toBe(false);
      session = null;
    });
  });

  describe('navigateTo', () => {
    let session: BrowserSession;

    beforeAll(async () => {
      session = await launchBrowser({ headless: true });
    });

    afterAll(async () => {
      await session.close();
    });

    it('should navigate to a URL', async () => {
      await navigateTo(session.page, 'https://example.com');

      const url = session.page.url();
      expect(url).toContain('example.com');
    });

    it('should navigate with domcontentloaded wait', async () => {
      await navigateTo(session.page, 'https://example.com', {
        waitUntil: 'domcontentloaded',
      });

      const title = await session.page.title();
      expect(title).toBeTruthy();
    });

    it('should navigate with commit wait (fastest)', async () => {
      await navigateTo(session.page, 'https://example.com', {
        waitUntil: 'commit',
      });

      const url = session.page.url();
      expect(url).toContain('example.com');
    });

    it('should navigate with load wait', async () => {
      await navigateTo(session.page, 'https://example.com', {
        waitUntil: 'load',
      });

      const content = await session.page.content();
      expect(content).toContain('Example Domain');
    });
  });

  describe('page extraction integration', () => {
    let session: BrowserSession;

    beforeAll(async () => {
      session = await launchBrowser({ headless: true });
      await navigateTo(session.page, 'https://example.com');
    });

    afterAll(async () => {
      await session.close();
    });

    it('should extract text content from page', async () => {
      const text = await session.page.locator('h1').textContent();
      expect(text).toBe('Example Domain');
    });

    it('should extract multiple elements', async () => {
      const paragraphs = await session.page.locator('p').allTextContents();
      expect(paragraphs.length).toBeGreaterThan(0);
    });

    it('should extract attribute from element', async () => {
      const href = await session.page.locator('a').getAttribute('href');
      expect(href).toContain('iana.org');
    });

    it('should extract HTML content', async () => {
      const html = await session.page.locator('div').first().innerHTML();
      expect(html).toContain('h1');
    });

    it('should wait for selector', async () => {
      const locator = session.page.locator('h1');
      await locator.waitFor({ timeout: 5000 });

      const isVisible = await locator.isVisible();
      expect(isVisible).toBe(true);
    });

    it('should handle non-existent selector gracefully', async () => {
      const count = await session.page.locator('.non-existent-class').count();
      expect(count).toBe(0);
    });
  });
});

describe('browser error handling', () => {
  it('should throw error for invalid CDP URL', async () => {
    const { connectToExisting } = await import('../src/lib/browser.js');

    await expect(
      connectToExisting({ debugUrl: 'http://localhost:99999' })
    ).rejects.toThrow();
  });

  it('should throw error for invalid URL navigation', async () => {
    const session = await launchBrowser({ headless: true });

    try {
      await expect(
        navigateTo(session.page, 'not-a-valid-url')
      ).rejects.toThrow();
    } finally {
      await session.close();
    }
  });
});
