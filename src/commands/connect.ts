import { Command } from 'commander';
import ora from 'ora';
import { connectToExisting, navigateTo } from '../lib/browser.js';
import { extractFromPage, type ExtractionOptions } from '../lib/extractor.js';
import { formatOutput, success, error, info, type OutputFormat } from '../lib/output.js';

export const connectCommand = new Command('connect')
  .description('Connect to an existing browser instance via CDP')
  .argument('<url>', 'URL to navigate to')
  .requiredOption('--debug-url <endpoint>', 'Chrome DevTools Protocol endpoint (e.g., http://localhost:9222)')
  .option('-s, --selector <selector>', 'CSS or XPath selector to extract')
  .option('--xpath', 'Treat selector as XPath instead of CSS')
  .option('-a, --attribute <name>', 'Extract attribute value instead of text')
  .option('--html', 'Extract HTML content instead of text')
  .option('--markdown', 'Convert extracted HTML to Markdown')
  .option('-m, --multiple', 'Extract all matching elements', false)
  .option('-o, --output <format>', 'Output format: json, text, lines, markdown', 'text')
  .option('--no-wait', 'Do not wait for selector to appear')
  .option('--timeout <ms>', 'Timeout for waiting (default: 10000)', '10000')
  .action(async (url, options) => {
    const spinner = ora('Connecting to browser...').start();

    try {
      const session = await connectToExisting({ debugUrl: options.debugUrl });
      spinner.succeed('Connected to browser');

      const navSpinner = ora(`Navigating to ${url}...`).start();
      await navigateTo(session.page, url);
      navSpinner.succeed('Page loaded');

      if (options.selector) {
        const extractSpinner = ora('Extracting content...').start();

        const useMarkdown = options.markdown || options.output === 'markdown';
        const extractionOptions: ExtractionOptions = {
          selector: options.selector,
          selectorType: options.xpath ? 'xpath' : 'css',
          extractionType: useMarkdown || options.html ? 'html' : options.attribute ? 'attribute' : 'text',
          attribute: options.attribute,
          multiple: options.multiple,
          waitFor: options.wait,
          timeout: parseInt(options.timeout, 10),
        };

        const result = await extractFromPage(session.page, extractionOptions);
        extractSpinner.stop();

        const outputFormat = useMarkdown ? 'markdown' : options.output;
        const output = formatOutput(result, {
          format: outputFormat as OutputFormat,
        });

        console.log(output);

        if (result.success) {
          info(`Extracted ${result.count} item(s)`);
        }
      } else {
        success('Connected and navigated. Use --selector to extract content.');
      }

      await session.close();
    } catch (err) {
      spinner.fail('Connection failed');
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });
