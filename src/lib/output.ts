import chalk from 'chalk';
import type { ExtractionResult } from './extractor.js';

export type OutputFormat = 'json' | 'text' | 'lines';

export interface FormatOptions {
  format: OutputFormat;
  pretty?: boolean;
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
