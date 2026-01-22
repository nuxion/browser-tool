# Skill: browser-tool

Use this skill when you need to scrape web content, extract data from websites, or automate browser interactions.

## Overview

`browser-tool` is a CLI for browser automation and web content extraction. It can:
- Launch a new headless browser and navigate to URLs
- Connect to an existing browser session via Chrome DevTools Protocol (CDP)
- Extract content using CSS selectors or XPath
- Convert HTML to clean Markdown
- Output results in JSON, text, lines, or markdown formats

## Commands

### 1. Launch New Browser

Use when you need to fetch and extract content from a public URL.

```bash
browser-tool launch <url> [options]
```

**Common patterns:**

```bash
# Extract single element text
browser-tool launch "https://example.com" -s "h1"

# Extract multiple elements as JSON
browser-tool launch "https://example.com" -s ".item" -m -o json

# Extract href attributes from all links
browser-tool launch "https://example.com" -s "a" -a href -m -o lines

# Extract page content as Markdown
browser-tool launch "https://example.com" -s "article" --markdown

# Extract with visible browser (debugging)
browser-tool launch "https://example.com" --no-headless -s "h1"

# Fast extraction from heavy sites
browser-tool launch "https://news-site.com" --wait-until commit -s "main" --markdown

# Custom viewport for mobile testing
browser-tool launch "https://example.com" --viewport 375x812 -s ".mobile-nav"
```

### 2. Connect to Existing Browser

Use when you need to scrape from authenticated sessions or preserve browser state.

**Prerequisites:** User must start Chrome with debugging enabled:
```bash
google-chrome --remote-debugging-port=9222
```

```bash
browser-tool connect <url> --debug-url http://localhost:9222 [options]
```

**Common patterns:**

```bash
# Extract from authenticated dashboard
browser-tool connect "https://app.example.com/dashboard" --debug-url http://localhost:9222 -s ".user-data" -m

# Extract using XPath
browser-tool connect "https://example.com" --debug-url http://localhost:9222 -s "//div[@class='content']" --xpath

# Extract as Markdown from logged-in session
browser-tool connect "https://app.example.com/article" --debug-url http://localhost:9222 -s ".content" --markdown
```

### 3. Extract from Saved HTML

Use when you have HTML files saved locally.

```bash
browser-tool extract <file.html> -s <selector> [options]
```

**Common patterns:**

```bash
# Extract from local file
browser-tool extract page.html -s ".product-title" -m -o json

# Extract image sources
browser-tool extract page.html -s "img" -a src -m -o lines

# Convert saved HTML to Markdown
browser-tool extract page.html -s "article" --markdown
```

## Options Reference

| Option | Description |
|--------|-------------|
| `-s, --selector <sel>` | CSS or XPath selector |
| `--xpath` | Interpret selector as XPath |
| `-m, --multiple` | Extract all matching elements |
| `-a, --attribute <name>` | Extract attribute value |
| `--html` | Extract innerHTML instead of text |
| `--markdown` | Convert HTML to clean Markdown |
| `-o, --output <format>` | Output: `json`, `text`, `lines`, `markdown` |
| `--headless` / `--no-headless` | Browser visibility |
| `--viewport <WxH>` | Viewport size (e.g., `1920x1080`) |
| `--wait-until <event>` | Navigation wait: `commit`, `domcontentloaded`, `load`, `networkidle` |
| `--timeout <ms>` | Wait timeout (default: 10000) |

## Navigation Wait Options

| Value | Description | Use case |
|-------|-------------|----------|
| `commit` | Response received | Fastest, heavy sites with ads |
| `domcontentloaded` | DOM ready (default) | Most sites |
| `load` | All resources loaded | When images/assets needed |
| `networkidle` | No network for 500ms | SPAs, dynamic content |

## Output Formats

**json** - Structured output with count:
```json
{"data": ["Item 1", "Item 2"], "count": 2}
```

**lines** - One result per line (good for piping):
```
Item 1
Item 2
```

**text** - Results separated by blank lines (default)

**markdown** - HTML converted to clean Markdown (scripts/styles removed)

## Selector Examples

**CSS:**
- `h1` - Element by tag
- `.class-name` - By class
- `#element-id` - By ID
- `div.container > p` - Direct child
- `a[href^="https"]` - Attribute starts with
- `article, main, .content` - Multiple selectors

**XPath:**
- `//h1` - Element anywhere
- `//div[@class='content']` - By attribute
- `//a[contains(@href, 'example')]` - Contains
- `(//p)[1]` - First match

## Error Handling

The tool provides clear error messages:
- **Connection failures**: Check if browser is running with `--remote-debugging-port`
- **Selector not found**: Verify selector syntax, increase `--timeout`
- **Navigation timeout**: Use `--wait-until commit` for heavy sites

## Best Practices

1. **Start simple**: Test with `-s "body"` first to verify connectivity
2. **Use JSON for parsing**: When processing results programmatically, use `-o json`
3. **Multiple elements**: Always use `-m` when expecting more than one result
4. **Debug visually**: Use `--no-headless` to see what the browser sees
5. **Heavy sites**: Use `--wait-until commit` to avoid timeout on sites with many ads
6. **Clean content**: Use `--markdown` to get readable text without HTML noise
7. **Target content**: Select `article`, `main`, or `.content` instead of `body` for cleaner results

## Example Workflows

### Scrape headlines from news site
```bash
browser-tool launch "https://news.ycombinator.com" -s ".titleline > a" -m -o json
```

### Extract article as Markdown
```bash
browser-tool launch "https://blog.example.com/post" -s "article" --markdown
```

### Extract product data
```bash
browser-tool launch "https://shop.example.com/products" -s ".product-card" -m -o json
```

### Get all image URLs
```bash
browser-tool launch "https://example.com" -s "img" -a src -m -o lines
```

### Fast extraction from heavy news site
```bash
browser-tool launch "https://news-site.com" --wait-until commit -s "main" --markdown --timeout 15000
```

### Extract from authenticated session
```bash
# User starts Chrome first: google-chrome --remote-debugging-port=9222
# User logs in manually, then:
browser-tool connect "https://app.example.com/data" --debug-url http://localhost:9222 -s ".private-data" --markdown
```
