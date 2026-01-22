import { Command } from 'commander';
import ora from 'ora';
import { launchBrowser, navigateTo } from '../lib/browser.js';
import { extractFromPage, type ExtractionOptions } from '../lib/extractor.js';
import { formatOutput, success, error, info, type OutputFormat } from '../lib/output.js';

export const launchCommand = new Command('launch')
  .description('Launch a new browser instance')
  .argument('<url>', 'URL to navigate to')
  .option('--headless', 'Run browser in headless mode', true)
  .option('--no-headless', 'Run browser with visible window')
  .option('--private', 'Launch in private/incognito mode', true)
  .option('--viewport <size>', 'Viewport size (e.g., 1920x1080)')
  .option('--user-agent <string>', 'Custom user agent string')
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
    const spinner = ora('Launching browser...').start();

    let session;

    try {
      const launchOptions: Parameters<typeof launchBrowser>[0] = {
        headless: options.headless,
        private: options.private,
      };

      if (options.viewport) {
        const [width, height] = options.viewport.split('x').map(Number);
        if (width && height) {
          launchOptions.viewport = { width, height };
        }
      }

      if (options.userAgent) {
        launchOptions.userAgent = options.userAgent;
      }

      session = await launchBrowser(launchOptions);
      spinner.succeed('Browser launched');

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
        success('Browser launched and navigated. Use --selector to extract content.');
      }

      await session.close();
    } catch (err) {
      spinner.fail('Failed');
      error(err instanceof Error ? err.message : 'Unknown error');
      if (session) await session.close();
      process.exit(1);
    }
  });
