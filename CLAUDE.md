# Claude Code / OpenCode Project Context

This file provides context for AI coding assistants working on this project.

## Project Summary

**browser-tool** is a TypeScript CLI for browser automation and web scraping built with Playwright.

## Tech Stack

- **Runtime**: Node.js >= 18
- **Language**: TypeScript (ES modules)
- **Browser**: Playwright (Chromium)
- **CLI**: Commander.js
- **Parsing**: Cheerio (for saved HTML)
- **UI**: chalk (colors), ora (spinners)

## Project Structure

```
├── src/
│   ├── index.ts           # CLI entry point
│   ├── commands/
│   │   ├── connect.ts     # CDP connection command
│   │   ├── launch.ts      # Browser launch command
│   │   └── extract.ts     # HTML file extraction
│   └── lib/
│       ├── browser.ts     # Browser session management
│       ├── extractor.ts   # Content extraction logic
│       └── output.ts      # Output formatting
├── GOAL.md                # Requirements & success criteria
├── README.md              # User documentation
└── .claude/skills/        # AI assistant skills
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/browser.ts` | `connectToExisting()` and `launchBrowser()` functions |
| `src/lib/extractor.ts` | `extractFromPage()` (Playwright) and `extractFromHtml()` (Cheerio) |
| `src/commands/*.ts` | CLI command implementations |
| `GOAL.md` | Project requirements for agents |

## Development Commands

```bash
npm install                    # Install dependencies
npx playwright install chromium # Install browser
npm run dev -- <command>       # Run in dev mode
npm run build                  # Compile TypeScript
npm run typecheck              # Type check only
```

## Skills

The following skills are available in `.claude/skills/`:

- **browser-tool.md** - How to use the CLI for web scraping tasks

## Code Conventions

1. **ESM modules**: Use `.js` extensions in imports (TypeScript compiles to ESM)
2. **Async/await**: All browser operations are async
3. **Error handling**: Wrap browser operations in try/catch, always close sessions
4. **Types**: Export interfaces from `lib/` modules, use strict TypeScript
5. **Output**: Use `ora` for spinners, `chalk` for colors, never raw `console.log` for status

## Common Tasks

### Adding a new command

1. Create `src/commands/newcmd.ts`
2. Export a `Command` instance from commander
3. Import and add to `src/index.ts` via `program.addCommand()`

### Adding extraction options

1. Update `ExtractionOptions` interface in `src/lib/extractor.ts`
2. Add option parsing in relevant command files
3. Implement logic in `extractFromPage()` or `extractFromHtml()`

### Testing the tool

```bash
# Quick test - extract from example.com
npm run dev -- launch https://example.com -s "h1"

# Test CDP connection (start Chrome first with --remote-debugging-port=9222)
npm run dev -- connect https://example.com --debug-url http://localhost:9222 -s "h1"
```

## Important Notes

- Always call `session.close()` after browser operations
- CDP connections don't close the browser, only disconnect
- Cheerio doesn't support XPath (use CSS selectors for HTML files)
- Default timeout is 10 seconds for element waiting
