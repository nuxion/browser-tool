# Browser Tool - Project Goal

## Overview

A command-line tool for browser automation and web content extraction. The tool provides two operational modes for browser connectivity and robust content extraction capabilities.

## Core Requirements

### 1. Browser Connection Modes

The tool MUST support two mutually exclusive browser connection modes:

#### Mode A: Connect to Existing Browser
- Connect to an already running browser instance via Chrome DevTools Protocol (CDP)
- User provides the debugging endpoint URL (e.g., `http://localhost:9222`)
- Use case: Attach to a browser session where user is already authenticated or has specific state

#### Mode B: Spawn New Browser Session
- Launch a new browser instance in private/incognito mode
- The tool manages the browser lifecycle (start and cleanup)
- Configurable options: headless mode, viewport size, user agent

### 2. Content Extraction

The tool MUST be able to extract content from web pages:

- **Selectors**: Support CSS selectors and XPath for targeting elements
- **Extraction types**:
  - Text content
  - HTML content
  - Attribute values
  - Multiple elements (lists)
- **Output formats**: JSON, plain text, or structured data
- **Dynamic content**: Wait for elements/network idle before extraction

### 3. CLI Interface

The tool MUST provide a user-friendly command-line interface:

```
browser-tool connect <url> --debug-url <endpoint>   # Mode A
browser-tool launch <url> [--headless] [--private]  # Mode B
browser-tool extract --selector <css|xpath> --output <format>
```

## Technical Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Language | TypeScript |
| Browser Automation | Playwright |
| HTML Parsing | Cheerio (for offline/saved HTML) |
| CLI Framework | Commander.js |
| Terminal UI | chalk, ora |

## Architecture

```
src/
├── index.ts              # CLI entry point
├── commands/
│   ├── connect.ts        # Connect to existing browser
│   ├── launch.ts         # Launch new browser
│   └── extract.ts        # Content extraction command
└── lib/
    ├── browser.ts        # Browser connection/management
    ├── extractor.ts      # Content extraction logic
    └── output.ts         # Output formatting
```

## Agent Instructions

When implementing features for this project:

1. **Browser Connection**: Use Playwright's `connectOverCDP()` for Mode A and `launch()` for Mode B
2. **Error Handling**: Provide clear error messages for connection failures, timeouts, and selector mismatches
3. **Graceful Cleanup**: Always ensure browser resources are released on exit or error
4. **Type Safety**: Maintain strict TypeScript types for all interfaces
5. **User Feedback**: Use spinners (ora) for long operations and colored output (chalk) for status messages

## Success Criteria

- [ ] Can connect to a running Chrome/Chromium instance via CDP
- [ ] Can spawn a new private browser session
- [ ] Can extract text content using CSS selectors
- [ ] Can extract content using XPath
- [ ] Can output results in JSON format
- [ ] Provides helpful error messages
- [ ] Cleans up browser resources properly
