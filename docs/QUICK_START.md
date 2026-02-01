# Quick Start - Test the Extension

Follow these steps to test the Accessibility Audit extension immediately.

## 1. Install Dependencies (5 minutes)

```bash
cd /Users/iggyvillamar/Documents/REPOS/accessibility-extension
npm install
```

Wait for installation to complete. You should see:
- No errors
- ~200-300 packages installed
- "added XXX packages" message

## 2. Start Development Build (30 seconds)

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Leave this terminal running.** The extension will rebuild automatically when you make code changes.

## 3. Load in Chrome (2 minutes)

1. Open Chrome
2. Go to: `chrome://extensions/`
3. Toggle **"Developer mode"** ON (top-right corner)
4. Click **"Load unpacked"**
5. Navigate to: `/Users/iggyvillamar/Documents/REPOS/accessibility-extension/dist`
6. Click **"Select"**

You should now see "Accessibility Audit v0.1.0" in your extensions list.

## 4. Test the Extension (5 minutes)

### Basic Test

1. **Navigate to a test page:**
   - Open a new tab
   - Go to: https://webaim.org/articles/
   - OR go to: https://www.wikipedia.org

2. **Open the side panel:**
   - Click the extension icon in your Chrome toolbar
   - The side panel should open on the right side

3. **Run a scan:**
   - Click the blue **"Run Scan"** button
   - Wait 1-3 seconds for the scan to complete
   - You should see issues appear grouped by severity

4. **Explore results:**
   - Critical/Serious/Moderate/Minor sections should appear
   - Click any issue to see details
   - Try the Developer/QA/Designer tabs
   - Check the WCAG level badges

5. **Export results:**
   - Click the download icon (next to "Run Scan")
   - A JSON file should download
   - Open it to verify the structure

### What Should Work

✅ **Working:**
- Extension loads without errors
- Side panel opens
- Scan button triggers scan
- Results appear in list
- Issue details show on click
- Export downloads JSON file
- Summary badges show counts

❌ **Not Yet Implemented:**
- Visual highlights on the page
- Element picker
- Filters/search
- Manual checklists UI
- Settings page

## 5. Check for Errors

### Side Panel Console

1. Right-click inside the side panel
2. Select **"Inspect"**
3. Go to **Console** tab
4. Look for errors (red messages)

**Expected:** No errors, maybe some info logs

### Page Console

1. Right-click on the web page (not side panel)
2. Select **"Inspect"**
3. Go to **Console** tab
4. Look for "Accessibility Audit content script loaded"

**Expected:** Content script loaded message, scan results

### Background Service Worker

1. Go to `chrome://extensions/`
2. Find "Accessibility Audit"
3. Click **"Inspect views: service worker"**
4. Check Console tab

**Expected:** "Background service worker initialized"

## Troubleshooting

### "dist folder not found"

**Problem:** Clicked "Load unpacked" but `dist` folder doesn't exist

**Solution:**
```bash
# Make sure dev server is running
npm run dev
```

### "Scan button does nothing"

**Problem:** Click scan but no results appear

**Check:**
1. Browser console for errors (right-click page → Inspect)
2. Side panel console for errors (right-click panel → Inspect)
3. Content script loaded (should see log message)

**Fix:**
```bash
# Restart dev server
# Press Ctrl+C in terminal
npm run dev

# Then refresh extension at chrome://extensions/
```

### "Side panel is blank"

**Problem:** Side panel opens but shows nothing

**Check:**
1. Right-click side panel → Inspect → Console
2. Look for React errors

**Common causes:**
- TypeScript compilation error (check `npm run dev` output)
- Missing dependency (run `npm install`)

### TypeScript errors during build

**Problem:** `npm run dev` shows TypeScript errors

**Solution:**
```bash
# Check for specific errors and fix them, or:
npm run type-check

# To ignore and build anyway (not recommended):
# Edit tsconfig.json and set "strict": false
```

## Next Steps

Once the extension is working:

1. **Try different websites:**
   - https://github.com
   - https://www.amazon.com
   - Your own local development sites

2. **Review the code:**
   - `src/services/scanner.ts` - Core scanning logic
   - `src/sidepanel/App.tsx` - Main UI
   - `src/types/issue.ts` - Data models

3. **Implement missing features:**
   - See IMPLEMENTATION_STATUS.md for what's left
   - Start with highlighting (Phase 4)
   - Then add filters and manual checklists

4. **Read the docs:**
   - [GETTING_STARTED.md](./GETTING_STARTED.md) - Detailed setup
   - [README.md](./README.md) - Project overview
   - [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - What's done/todo

## Expected First Run Experience

**Timeline:**
- Install dependencies: ~3-5 minutes
- Start dev server: ~30 seconds
- Load in Chrome: ~1 minute
- First scan: ~2-3 seconds
- **Total: ~10 minutes** to working extension

**What you'll have:**
- ✅ Functional accessibility scanner
- ✅ Clean, modern UI
- ✅ Detailed issue information
- ✅ Role-specific recommendations
- ✅ Export capability
- ✅ Solid foundation to build on

**What you won't have yet:**
- ❌ Visual page highlights
- ❌ Element picker
- ❌ Filters and search
- ❌ Manual checklists UI
- ❌ Settings page

These are planned for Phases 4-7 of the implementation plan.

## Success Criteria

You'll know it's working when:

1. ✅ Extension loads without console errors
2. ✅ Side panel opens when you click the icon
3. ✅ "Run Scan" button triggers a scan
4. ✅ Issues appear grouped by severity
5. ✅ Click an issue shows details on the right
6. ✅ Export button downloads a JSON file
7. ✅ JSON file contains valid issue data

If all 7 criteria are met, **congratulations!** You have a working accessibility auditing extension.

## Getting Help

If you get stuck:

1. Check the Troubleshooting section above
2. Review console errors carefully
3. Check `npm run dev` output for build errors
4. Verify all dependencies: `npm list --depth=0`
5. Try a clean reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

## Development Tips

**Hot reload works for:**
- React component changes (side panel)
- CSS/Tailwind changes
- Type definition changes

**Requires manual refresh:**
- Background worker changes → Refresh at `chrome://extensions/`
- Content script changes → Refresh the web page
- Manifest changes → Disable/enable extension

**Best practice:**
After making changes:
1. Check `npm run dev` terminal for errors
2. Refresh extension at `chrome://extensions/`
3. Reload the test page
4. Re-run scan to test changes
