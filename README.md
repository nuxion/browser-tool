# browser-tool

A CLI tool for browser automation and web content extraction. Connect to existing browser sessions or launch new ones, then extract content using CSS selectors or XPath.

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Quick Start

```bash
# Launch a browser and extract all headlines
npm run dev -- launch https://news.ycombinator.com -s ".titleline > a" -m

# Extract as JSON
npm run dev -- launch https://example.com -s "h1" -o json
```

## Commands

### `launch` - Launch a New Browser

Spawns a new browser instance, navigates to a URL, and optionally extracts content.

```bash
browser-tool launch <url> [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--headless` | Run in headless mode | `true` |
| `--no-headless` | Show browser window | - |
| `--private` | Use private/incognito mode | `true` |
| `--viewport <size>` | Viewport size (e.g., `1920x1080`) | - |
| `--user-agent <string>` | Custom user agent | - |
| `-s, --selector <sel>` | CSS/XPath selector to extract | - |
| `--xpath` | Treat selector as XPath | `false` |
| `-a, --attribute <name>` | Extract attribute instead of text | - |
| `--html` | Extract HTML instead of text | `false` |
| `--markdown` | Convert extracted HTML to Markdown | `false` |
| `-m, --multiple` | Extract all matching elements | `false` |
| `-o, --output <format>` | Output format: `json`, `text`, `lines`, `markdown` | `text` |
| `--timeout <ms>` | Wait timeout in milliseconds | `10000` |

**Examples:**

```bash
# Extract page title
browser-tool launch https://example.com -s "title"

# Extract all links with their href attributes
browser-tool launch https://example.com -s "a" -a href -m -o json

# Extract with visible browser window
browser-tool launch https://example.com --no-headless -s "h1"

# Custom viewport for responsive testing
browser-tool launch https://example.com --viewport 375x812 -s ".mobile-menu"

# Extract article content as Markdown
browser-tool launch https://example.com -s "article" --markdown
```

### `connect` - Connect to Existing Browser

Connects to an already running browser via Chrome DevTools Protocol (CDP). Useful for scraping sites where you're already logged in.

```bash
browser-tool connect <url> --debug-url <endpoint> [options]
```

**Required:**

| Option | Description |
|--------|-------------|
| `--debug-url <endpoint>` | CDP endpoint (e.g., `http://localhost:9222`) |

**Starting Chrome with debugging enabled:**

```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222

# Windows
chrome.exe --remote-debugging-port=9222
```

**Examples:**

```bash
# Connect and extract from authenticated session
browser-tool connect https://dashboard.example.com --debug-url http://localhost:9222 -s ".user-data" -m

# Extract using XPath
browser-tool connect https://example.com --debug-url http://localhost:9222 -s "//div[@class='content']" --xpath
```

### `extract` - Extract from Saved HTML

Parse and extract content from a local HTML file using Cheerio.

```bash
browser-tool extract <file> -s <selector> [options]
```

**Examples:**

```bash
# Extract from downloaded page
browser-tool extract page.html -s ".product-title" -m

# Extract specific attribute
browser-tool extract page.html -s "img" -a src -m -o lines
```

## Output Formats

| Format | Description |
|--------|-------------|
| `text` | Plain text, multiple results separated by blank lines |
| `lines` | One result per line |
| `json` | JSON object with `data` and `count` fields |
| `markdown` | HTML converted to Markdown (uses Turndown) |

**JSON output example:**

```json
{
  "data": ["First heading", "Second heading"],
  "count": 2
}
```

**Markdown output example:**

```bash
browser-tool launch https://example.com -s "article" --markdown
```

Output:
```markdown
# Article Title

Some **bold** text and a [link](https://example.com).

- List item 1
- List item 2
```

## Selector Examples

**CSS Selectors:**

```bash
-s "h1"                      # Element
-s ".class-name"             # Class
-s "#element-id"             # ID
-s "div.container > p"       # Direct child
-s "a[href^='https']"        # Attribute selector
-s "ul li:first-child"       # Pseudo-selector
```

**XPath Selectors:**

```bash
-s "//h1" --xpath                           # Element
-s "//div[@class='content']" --xpath        # Class attribute
-s "//a[contains(@href, 'example')]" --xpath # Contains
-s "(//p)[1]" --xpath                        # First paragraph
```

## Development

```bash
# Run in development mode
npm run dev -- <command>

# Type check
npm run typecheck

# Build for production
npm run build

# Run built version
npm run start -- <command>
```

## Requirements

- Node.js >= 18.0.0
- Chromium browser (installed via Playwright)

## License

MIT
