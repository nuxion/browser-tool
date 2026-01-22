import { Command } from 'commander';
import { readFileSync } from 'fs';
import { extractFromHtml } from '../lib/extractor.js';
import { formatOutput, error, info, type OutputFormat } from '../lib/output.js';

export const extractCommand = new Command('extract')
  .description('Extract content from a saved HTML file')
  .argument('<file>', 'Path to HTML file')
  .requiredOption('-s, --selector <selector>', 'CSS selector to extract')
  .option('-a, --attribute <name>', 'Extract attribute value instead of text')
  .option('--html', 'Extract HTML content instead of text')
  .option('-m, --multiple', 'Extract all matching elements', false)
  .option('-o, --output <format>', 'Output format: json, text, lines', 'text')
  .action(async (file, options) => {
    try {
      const html = readFileSync(file, 'utf-8');

      const result = extractFromHtml(html, {
        selector: options.selector,
        selectorType: 'css',
        extractionType: options.html ? 'html' : options.attribute ? 'attribute' : 'text',
        attribute: options.attribute,
        multiple: options.multiple,
      });

      const output = formatOutput(result, {
        format: options.output as OutputFormat,
      });

      console.log(output);

      if (result.success) {
        info(`Extracted ${result.count} item(s)`);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });
