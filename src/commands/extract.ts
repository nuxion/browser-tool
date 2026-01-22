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
  .option('--markdown', 'Convert extracted HTML to Markdown')
  .option('-m, --multiple', 'Extract all matching elements', false)
  .option('-o, --output <format>', 'Output format: json, text, lines, markdown', 'text')
  .action(async (file, options) => {
    try {
      const html = readFileSync(file, 'utf-8');

      const useMarkdown = options.markdown || options.output === 'markdown';
      const result = extractFromHtml(html, {
        selector: options.selector,
        selectorType: 'css',
        extractionType: useMarkdown || options.html ? 'html' : options.attribute ? 'attribute' : 'text',
        attribute: options.attribute,
        multiple: options.multiple,
      });

      const outputFormat = useMarkdown ? 'markdown' : options.output;
      const output = formatOutput(result, {
        format: outputFormat as OutputFormat,
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
