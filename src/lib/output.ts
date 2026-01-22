import chalk from 'chalk';
import TurndownService from 'turndown';
import type { ExtractionResult } from './extractor.js';

export type OutputFormat = 'json' | 'text' | 'lines' | 'markdown';

export interface FormatOptions {
  format: OutputFormat;
  pretty?: boolean;
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Remove script, style, and other non-content elements
turndown.remove(['script', 'style', 'noscript', 'iframe', 'svg', 'canvas', 'template']);

// Also remove elements that typically contain noise (hidden elements, ads, etc.)
turndown.addRule('removeHidden', {
  filter: (node) => {
    if (node.nodeType !== 1) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = node as any;
    const style = el.getAttribute?.('style') || '';
    const hidden = el.hasAttribute?.('hidden');
    const ariaHidden = el.getAttribute?.('aria-hidden') === 'true';
    return hidden || ariaHidden || style.includes('display:none') || style.includes('display: none');
  },
  replacement: () => '',
});

/**
 * Convert HTML string to Markdown
 */
export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html);
}

/**
 * Format extraction result for output
 */
export function formatOutput(result: ExtractionResult, options: FormatOptions): string {
  const { format, pretty = true } = options;

  if (!result.success) {
    return chalk.red(`Error: ${result.error}`);
  }

  if (result.data === null) {
    return chalk.yellow('No results found');
  }

  switch (format) {
    case 'json':
      return pretty
        ? JSON.stringify({ data: result.data, count: result.count }, null, 2)
        : JSON.stringify({ data: result.data, count: result.count });

    case 'lines':
      if (Array.isArray(result.data)) {
        return result.data.join('\n');
      }
      return result.data;

    case 'markdown':
      if (Array.isArray(result.data)) {
        return result.data.map(html => htmlToMarkdown(html)).join('\n\n---\n\n');
      }
      return htmlToMarkdown(result.data);

    case 'text':
    default:
      if (Array.isArray(result.data)) {
        return result.data.join('\n\n');
      }
      return result.data;
  }
}

/**
 * Print success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Print error message
 */
export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

/**
 * Print info message
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Print warning message
 */
export function warn(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}
