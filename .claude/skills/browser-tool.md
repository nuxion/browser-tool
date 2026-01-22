# Skill: browser-tool

Use this skill when you need to scrape web content, extract data from websites, or automate browser interactions.

## Overview

`browser-tool` is a CLI for browser automation and web content extraction. It can:
- Launch a new headless browser and navigate to URLs
- Connect to an existing browser session via Chrome DevTools Protocol (CDP)
- Extract content using CSS selectors or XPath
- Output results in JSON, text, or line-separated formats

## Commands

### 1. Launch New Browser

Use when you need to fetch and extract content from a public URL.

```bash
npx tsx src/index.ts launch <url> [options]
```

**Common patterns:**

```bash
# Extract single element text
npx tsx src/index.ts launch "https://example.com" -s "h1"

# Extract multiple elements as JSON
npx tsx src/index.ts launch "https://example.com" -s ".item" -m -o json

# Extract href attributes from all links
npx tsx src/index.ts launch "https://example.com" -s "a" -a href -m -o lines

# Extract with visible browser (debugging)
npx tsx src/index.ts launch "https://example.com" --no-headless -s "h1"

# Custom viewport for mobile testing
npx tsx src/index.ts launch "https://example.com" --viewport 375x812 -s ".mobile-nav"
```

### 2. Connect to Existing Browser

Use when you need to scrape from authenticated sessions or preserve browser state.

**Prerequisites:** User must start Chrome with debugging enabled:
```bash
google-chrome --remote-debugging-port=9222
```

```bash
npx tsx src/index.ts connect <url> --debug-url http://localhost:9222 [options]
```

**Common patterns:**

```bash
# Extract from authenticated dashboard
npx tsx src/index.ts connect "https://app.example.com/dashboard" --debug-url http://localhost:9222 -s ".user-data" -m

# Extract using XPath
npx tsx src/index.ts connect "https://example.com" --debug-url http://localhost:9222 -s "//div[@class='content']" --xpath
```

### 3. Extract from Saved HTML

Use when you have HTML files saved locally.

```bash
npx tsx src/index.ts extract <file.html> -s <selector> [options]
```

**Common patterns:**

```bash
# Extract from local file
npx tsx src/index.ts extract page.html -s ".product-title" -m -o json

# Extract image sources
npx tsx src/index.ts extract page.html -s "img" -a src -m -o lines
```

## Options Reference

| Option | Description |
|--------|-------------|
| `-s, --selector <sel>` | CSS or XPath selector |
| `--xpath` | Interpret selector as XPath |
| `-m, --multiple` | Extract all matching elements |
| `-a, --attribute <name>` | Extract attribute value |
| `--html` | Extract innerHTML instead of text |
| `-o, --output <format>` | Output: `json`, `text`, `lines` |
| `--headless` / `--no-headless` | Browser visibility |
| `--viewport <WxH>` | Viewport size (e.g., `1920x1080`) |
| `--timeout <ms>` | Wait timeout (default: 10000) |

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

## Selector Examples

**CSS:**
- `h1` - Element by tag
- `.class-name` - By class
- `#element-id` - By ID
- `div.container > p` - Direct child
- `a[href^="https"]` - Attribute starts with
- `ul li:first-child` - Pseudo-selector

**XPath:**
- `//h1` - Element anywhere
- `//div[@class='content']` - By attribute
- `//a[contains(@href, 'example')]` - Contains
- `(//p)[1]` - First match

## Error Handling

The tool provides clear error messages:
- Connection failures: Check if browser is running with `--remote-debugging-port`
- Selector not found: Verify selector syntax, increase `--timeout`
- Timeout: Element may not exist or page loads slowly

## Best Practices

1. **Start simple**: Test with `-s "body"` first to verify connectivity
2. **Use JSON for parsing**: When processing results programmatically, use `-o json`
3. **Multiple elements**: Always use `-m` when expecting more than one result
4. **Debug visually**: Use `--no-headless` to see what the browser sees
5. **Increase timeout**: For slow sites, use `--timeout 30000`

## Example Workflows

### Scrape headlines from news site
```bash
npx tsx src/index.ts launch "https://news.ycombinator.com" -s ".titleline > a" -m -o json
```

### Extract product data
```bash
npx tsx src/index.ts launch "https://shop.example.com/products" \
  -s ".product-card" -m -o json
```

### Get all image URLs
```bash
npx tsx src/index.ts launch "https://example.com" -s "img" -a src -m -o lines
```

### Extract from authenticated session
```bash
# User starts Chrome first: google-chrome --remote-debugging-port=9222
# User logs in manually, then:
npx tsx src/index.ts connect "https://app.example.com/data" \
  --debug-url http://localhost:9222 -s ".private-data" -m -o json
```
