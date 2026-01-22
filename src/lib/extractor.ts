import type { Page } from 'playwright';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';

export type SelectorType = 'css' | 'xpath';
export type ExtractionType = 'text' | 'html' | 'attribute';
export type OutputFormat = 'json' | 'text' | 'lines';

export interface ExtractionOptions {
  selector: string;
  selectorType?: SelectorType;
  extractionType?: ExtractionType;
  attribute?: string;
  multiple?: boolean;
  waitFor?: boolean;
  timeout?: number;
}

export interface ExtractionResult {
  success: boolean;
  data: string | string[] | null;
  count: number;
  error?: string;
}

/**
 * Extract content from a live page using Playwright
 */
export async function extractFromPage(
  page: Page,
  options: ExtractionOptions
): Promise<ExtractionResult> {
  const {
    selector,
    selectorType = 'css',
    extractionType = 'text',
    attribute,
    multiple = false,
    waitFor = true,
    timeout = 10000,
  } = options;

  try {
    const locatorSelector = selectorType === 'xpath'
      ? `xpath=${selector}`
      : selector;

    const locator = page.locator(locatorSelector);

    if (waitFor) {
      await locator.first().waitFor({ timeout });
    }

    if (multiple) {
      const elements = locator;
      const count = await elements.count();
      const results: string[] = [];

      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        const value = await extractValue(element, extractionType, attribute);
        if (value) results.push(value);
      }

      return { success: true, data: results, count: results.length };
    } else {
      const value = await extractValue(locator.first(), extractionType, attribute);
      return { success: true, data: value, count: value ? 1 : 0 };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, data: null, count: 0, error: message };
  }
}

async function extractValue(
  element: ReturnType<Page['locator']>,
  extractionType: ExtractionType,
  attribute?: string
): Promise<string | null> {
  switch (extractionType) {
    case 'text':
      return element.textContent();
    case 'html':
      return element.innerHTML();
    case 'attribute':
      if (!attribute) throw new Error('Attribute name required for attribute extraction');
      return element.getAttribute(attribute);
    default:
      return element.textContent();
  }
}

/**
 * Extract content from HTML string using Cheerio
 */
export function extractFromHtml(
  html: string,
  options: Omit<ExtractionOptions, 'waitFor' | 'timeout'>
): ExtractionResult {
  const {
    selector,
    selectorType = 'css',
    extractionType = 'text',
    attribute,
    multiple = false,
  } = options;

  try {
    const $ = cheerio.load(html);

    // Note: Cheerio has limited XPath support, primarily use CSS
    if (selectorType === 'xpath') {
      return {
        success: false,
        data: null,
        count: 0,
        error: 'XPath not supported for HTML parsing. Use CSS selectors or extract from live page.'
      };
    }

    const elements = $(selector);

    if (multiple) {
      const results: string[] = [];
      elements.each((_, el) => {
        const value = extractValueCheerio($, $(el), extractionType, attribute);
        if (value) results.push(value);
      });
      return { success: true, data: results, count: results.length };
    } else {
      const value = extractValueCheerio($, elements.first(), extractionType, attribute);
      return { success: true, data: value, count: value ? 1 : 0 };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, data: null, count: 0, error: message };
  }
}

function extractValueCheerio(
  $: cheerio.CheerioAPI,
  element: cheerio.Cheerio<AnyNode>,
  extractionType: ExtractionType,
  attribute?: string
): string | null {
  switch (extractionType) {
    case 'text':
      return element.text().trim() || null;
    case 'html':
      return element.html();
    case 'attribute':
      if (!attribute) throw new Error('Attribute name required for attribute extraction');
      return element.attr(attribute) ?? null;
    default:
      return element.text().trim() || null;
  }
}
