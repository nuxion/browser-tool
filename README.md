# browser-tool

A CLI tool for browser automation and web content extraction. Connect to existing browser sessions or launch new ones, then extract content using CSS selectors or XPath.

## Installation

```bash
# Install globally from npm
npm install -g @nuxion/browser-tool

# Install Playwright browsers
npx playwright install chromium
```

Or run directly without installing:

```bash
npx @nuxion/browser-tool launch https://example.com -s "h1"
```

## Quick Start

```bash
# Launch a browser and extract all headlines
browser-tool launch https://news.ycombinator.com -s ".titleline > a" -m

# Extract as JSON
browser-tool launch https://example.com -s "h1" -o json

# Extract article content as Markdown
browser-tool launch https://example.com -s "article" --markdown

# Fast extraction from heavy sites
browser-tool launch https://news-site.com --wait-until commit -s "main" --markdown
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
| `--wait-until <event>` | Navigation wait: `commit`, `domcontentloaded`, `load`, `networkidle` | `domcontentloaded` |
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

# Fast extraction from heavy sites (use commit for speed)
browser-tool launch https://news-site.com --wait-until commit -s "body" --markdown
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

## Navigation Wait Options

The `--wait-until` option controls when navigation is considered complete:

| Value | Description | Use case |
|-------|-------------|----------|
| `commit` | Response received | Fastest, for simple pages |
| `domcontentloaded` | DOM ready (default) | Most sites |
| `load` | All resources loaded | When images/assets needed |
| `networkidle` | No network for 500ms | SPAs, dynamic content |

For heavy sites with many ads/trackers, use `commit` or `domcontentloaded` to avoid timeouts.

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

For local development or contributing:

```bash
# Clone the repository
git clone https://github.com/nuxion/browser-tool.git
cd browser-tool

# Install dependencies
npm install

# Run in development mode
npm run dev -- <command>

# Type check
npm run typecheck

# Build for production
npm run build

# Link globally for local testing
npm run link
```

## AI Assistant Integration

This tool includes a skill file for AI coding assistants (Claude Code, OpenCode, etc.) that enables them to use `browser-tool` for web scraping tasks.

**Skill file location:** `examples/skill-browser-tool.md`

To use with Claude Code, copy the skill file to your project:

```bash
mkdir -p .claude/skills
cp examples/skill-browser-tool.md .claude/skills/
```

The skill teaches AI assistants how to:
- Launch browsers and extract content
- Connect to authenticated sessions
- Use selectors effectively
- Handle heavy sites with timeouts
- Convert content to Markdown

## Requirements

- Node.js >= 18.0.0
- Chromium browser (installed via Playwright)

## License

MIT
