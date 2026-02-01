# Getting Started

This guide will help you set up and run the Accessibility Audit Chrome Extension locally for development and testing.

## Prerequisites

Make sure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Chrome** browser

Verify installation:
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 8.x or higher
```

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd /Users/iggyvillamar/Documents/REPOS/accessibility-extension
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install all required packages including:
   - React 18
   - TypeScript
   - Vite build tooling
   - axe-core accessibility engine
   - Tailwind CSS and UI components
   - Chrome extension utilities

   Installation typically takes 1-2 minutes.

## Development

### Start Development Server

```bash
npm run dev
```

This starts Vite in watch mode. The extension will rebuild automatically when you make changes to the source code.

**What this does:**
- Compiles TypeScript to JavaScript
- Processes React components
- Bundles extension files into `dist/` directory
- Watches for file changes and rebuilds

Keep this terminal window open while developing.

### Load Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`

2. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the extension:**
   - Click "Load unpacked"
   - Navigate to and select the `dist` directory in this project
   - The extension should now appear in your extensions list

4. **Verify installation:**
   - You should see "Accessibility Audit" with version 0.1.0
   - The extension icon should appear in the Chrome toolbar

### Using the Extension

1. **Navigate to any website** (try a complex site like Wikipedia or GitHub)

2. **Open the side panel:**
   - Click the extension icon in the Chrome toolbar
   - OR use Chrome's side panel button (if available)

3. **Run a scan:**
   - Click the "Run Scan" button in the side panel
   - Wait for the scan to complete (usually 1-3 seconds)

4. **Review results:**
   - Issues are grouped by severity: Critical, Serious, Moderate, Minor
   - Click any issue to see detailed information
   - View role-specific recommendations (Developer, QA, Designer)

5. **Export results:**
   - Click the download icon to export as JSON

### Development Workflow

**When you make code changes:**

1. Save the file (Ctrl+S / Cmd+S)
2. The dev server will automatically rebuild
3. Go to `chrome://extensions/`
4. Click the refresh icon on the "Accessibility Audit" extension
5. Reload the page you're testing
6. Test your changes

**Hot Module Replacement (HMR) works for:**
- React components in the side panel
- CSS changes
- Type definitions

**Requires manual refresh:**
- Background service worker changes
- Content script changes
- Manifest changes

## Testing

### Manual Testing Checklist

Test on these pages for comprehensive coverage:

1. **Simple page**: https://example.com
2. **Complex app**: https://github.com
3. **Accessibility test pages**: https://webaim.org/articles/
4. **Local development sites**: http://localhost:3000 (if you have any)

**What to test:**

- [ ] Scan completes without errors
- [ ] Issues appear in the side panel
- [ ] Issue details load correctly
- [ ] Severity badges display with correct colors
- [ ] WCAG level badges show (A, AA, AAA)
- [ ] Recommendations appear in tabs (Developer, QA, Designer)
- [ ] Export downloads a valid JSON file
- [ ] Re-scanning updates results

### Check Browser Console

While testing, keep Chrome DevTools open:

1. **For side panel errors:**
   - Right-click the side panel → "Inspect"
   - Check Console tab for errors

2. **For content script errors:**
   - Right-click on the web page → "Inspect"
   - Check Console tab for errors

3. **For background script errors:**
   - Go to `chrome://extensions/`
   - Find "Accessibility Audit"
   - Click "Inspect views: service worker"
   - Check Console tab

## Building for Production

```bash
npm run build
```

This creates an optimized production build in `dist/`:
- Minified JavaScript
- Optimized CSS
- Source maps for debugging

The production build is smaller and faster than the development build.

## Troubleshooting

### "npm install" fails

**Error:** `EACCES: permission denied`
- **Solution:** Don't use `sudo`. Fix npm permissions:
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  export PATH=~/.npm-global/bin:$PATH
  ```

**Error:** `Cannot find module`
- **Solution:** Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Extension doesn't load in Chrome

**Error:** "Manifest file is missing or unreadable"
- **Solution:** Make sure you selected the `dist` folder, not the root project folder
- Run `npm run dev` first to create the `dist` folder

**Error:** "Failed to load extension"
- **Solution:** Check the errors shown. Common issues:
  - TypeScript errors preventing build
  - Missing dependencies - run `npm install`
  - Syntax errors in manifest.json

### Scan button doesn't work

**Symptom:** Click "Run Scan" but nothing happens
- **Check:** Browser console for errors
- **Check:** Content script is loaded (look for "Accessibility Audit content script loaded" in page console)
- **Fix:** Refresh both the extension and the page

### Side panel is blank

**Symptom:** Side panel opens but shows nothing
- **Check:** Right-click side panel → Inspect → Console for errors
- **Common cause:** React render error
- **Fix:** Check for TypeScript errors in `npm run dev` output

### Changes not appearing

**Symptom:** Made code changes but they're not showing
- **Solution:**
  1. Check that `npm run dev` is still running
  2. Refresh the extension at `chrome://extensions/`
  3. Reload the web page
  4. For background worker changes, may need to disable/enable extension

## Next Steps

Once you have the extension running:

1. Review the [README.md](./README.md) for project structure
2. Check [accessibility-extension.md](./accessibility-extension.md) for requirements
3. Explore the codebase:
   - `src/services/scanner.ts` - Core scanning logic
   - `src/sidepanel/components/` - UI components
   - `src/types/` - TypeScript type definitions

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Check `npm run dev` output for build errors
3. Check browser console for runtime errors
4. Verify all dependencies installed: `npm list --depth=0`

## IDE Setup (Optional)

### VS Code

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features (built-in)

The project includes `.vscode/settings.json` with recommended settings.

### Type Checking

Run TypeScript type checking without building:
```bash
npm run type-check
```

This helps catch type errors before runtime.
