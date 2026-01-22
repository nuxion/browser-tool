import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

export interface ConnectOptions {
  debugUrl: string;
}

export interface LaunchOptions {
  headless?: boolean;
  private?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;
}

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  close: () => Promise<void>;
}

/**
 * Connect to an existing browser instance via Chrome DevTools Protocol
 */
export async function connectToExisting(options: ConnectOptions): Promise<BrowserSession> {
  const browser = await chromium.connectOverCDP(options.debugUrl);
  const contexts = browser.contexts();

  let context: BrowserContext;
  let page: Page;

  if (contexts.length > 0) {
    context = contexts[0];
    const pages = context.pages();
    page = pages.length > 0 ? pages[0] : await context.newPage();
  } else {
    context = await browser.newContext();
    page = await context.newPage();
  }

  return {
    browser,
    context,
    page,
    close: async () => {
      // Don't close the browser when connecting to existing - just disconnect
      await browser.close();
    },
  };
}

/**
 * Launch a new browser instance
 */
export async function launchBrowser(options: LaunchOptions = {}): Promise<BrowserSession> {
  const browser = await chromium.launch({
    headless: options.headless ?? true,
  });

  const contextOptions: Parameters<Browser['newContext']>[0] = {};

  if (options.viewport) {
    contextOptions.viewport = options.viewport;
  }

  if (options.userAgent) {
    contextOptions.userAgent = options.userAgent;
  }

  const context = options.private
    ? await browser.newContext(contextOptions)
    : await browser.newContext(contextOptions);

  const page = await context.newPage();

  return {
    browser,
    context,
    page,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

/**
 * Navigate to a URL and wait for the page to be ready
 */
export type WaitUntilOption = 'load' | 'domcontentloaded' | 'networkidle' | 'commit';

/**
 * Navigate to a URL and wait for the page to be ready
 */
export async function navigateTo(
  page: Page,
  url: string,
  options: { waitUntil?: WaitUntilOption } = {}
): Promise<void> {
  await page.goto(url, {
    waitUntil: options.waitUntil ?? 'domcontentloaded',
  });
}
