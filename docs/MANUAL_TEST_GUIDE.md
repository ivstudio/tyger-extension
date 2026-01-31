# Manual Testing Guide

## ✅ Build Complete - Ready to Test in Chrome

The extension has been successfully built and is ready for manual testing in Chrome browser.

---

## Quick Start (5 minutes)

### Step 1: Load the Extension

1. **Open Chrome browser**
2. **Go to:** `chrome://extensions/`
3. **Enable Developer mode** (toggle switch in top-right)
4. **Click:** "Load unpacked"
5. **Navigate to and select:** `/Users/iggyvillamar/Documents/REPOS/accessibility-extension/dist`
6. **Click:** "Select" or "Open"

✅ **Success:** Extension appears as "Accessibility Audit v0.1.0"

### Step 2: Test Basic Scanning

1. **Open a new tab**
2. **Go to:** https://webaim.org/articles/
3. **Click** the extension icon in Chrome toolbar
4. **Side panel opens** on the right side
5. **Click** the blue "Run Scan" button
6. **Wait** 1-3 seconds

✅ **Success:** Issues appear grouped by severity (Critical, Serious, Moderate, Minor)

### Step 3: Explore Results

1. **Click any issue** in the list
2. **Review** the details on the right:
   - Issue description
   - WCAG level and criteria
   - Element information (selector, HTML)
   - Recommendations tabs (Developer, QA, Designer)

✅ **Success:** Issue details display correctly

### Step 4: Test Export

1. **Click** the download icon (next to "Run Scan")
2. **File downloads** automatically
3. **Open** the JSON file

✅ **Success:** Valid JSON with complete scan data

---

## Detailed Testing Checklist

### Basic Functionality

- [ ] Extension loads in chrome://extensions without errors
- [ ] Extension icon appears in Chrome toolbar
- [ ] Side panel opens when clicking icon
- [ ] "Run Scan" button is visible
- [ ] Scan completes without errors
- [ ] Summary badges show correct counts
- [ ] Issues appear in left panel
- [ ] Issues are grouped by severity

### Issue Display

- [ ] Critical issues show red icon/border
- [ ] Serious issues show orange icon/border
- [ ] Moderate issues show yellow icon/border
- [ ] Minor issues show blue icon/border
- [ ] WCAG level badges display (A, AA, AAA)
- [ ] Element selectors are visible
- [ ] Issue count per severity is correct

### Issue Details

- [ ] Click issue shows details on right
- [ ] Title displays correctly
- [ ] Description is readable
- [ ] WCAG metadata shows (level, criteria, impact)
- [ ] Element info displays (selector, HTML snippet)
- [ ] Context information shows when available
- [ ] Recommendations appear in tabs
- [ ] Developer tab has recommendations
- [ ] QA tab has recommendations
- [ ] Designer tab appears when relevant
- [ ] Code examples show in developer recommendations
- [ ] "Learn More" link works

### Status Management

- [ ] Can click "Fixed" button
- [ ] Can click "Ignore" button
- [ ] Can click "Needs Design" button
- [ ] Status buttons highlight when selected
- [ ] Notes textarea is editable
- [ ] Can type notes and they persist

### Export

- [ ] Download icon is clickable
- [ ] JSON file downloads
- [ ] File has meaningful name (hostname-date.json)
- [ ] JSON is valid (opens without errors)
- [ ] JSON contains all scan data
- [ ] JSON includes metadata (version, timestamp)

### Re-scanning

- [ ] Can run multiple scans
- [ ] Previous results are replaced
- [ ] Summary updates correctly
- [ ] Issue list refreshes

---

## Test Sites

Try scanning these different types of sites:

### 1. Accessibility Test Site
**URL:** https://webaim.org/articles/
**Expected:** Multiple issues across all severity levels
**Best for:** Verifying scanner works correctly

### 2. Complex Single Page App
**URL:** https://github.com
**Expected:** Moderate number of issues
**Best for:** Testing on modern JavaScript apps

### 3. Traditional Website
**URL:** https://www.wikipedia.org
**Expected:** Various accessibility issues
**Best for:** Testing on content-heavy sites

### 4. Simple HTML Page
**URL:** https://example.com
**Expected:** Few or no issues
**Best for:** Verifying scanner handles simple pages

### 5. Your Own Projects
**URL:** http://localhost:3000 (or your local dev sites)
**Expected:** Varies
**Best for:** Real-world usage testing

---

## Debugging

### If Side Panel Doesn't Open

**Check:**
1. Extension is enabled in chrome://extensions
2. Refresh the extension (click refresh icon)
3. Try clicking icon again

**Look at:** Background worker console (chrome://extensions → Inspect views: service worker)

### If Scan Doesn't Work

**Check:**
1. Content script loaded (page console should show: "Accessibility Audit content script loaded")
2. No errors in page console
3. No errors in side panel console

**Try:**
1. Refresh the web page
2. Refresh the extension
3. Run scan again

**Look at:**
- Page console (F12 → Console)
- Side panel console (right-click panel → Inspect)

### If No Issues Appear

**Possible causes:**
1. Page actually has no issues (try different site)
2. Scan failed silently (check consoles for errors)
3. Content script not loaded (refresh page)

### Common Console Errors

**"Cannot read property 'run' of undefined"**
- axe-core not loaded
- Refresh extension and page

**"Chrome API not available"**
- Check manifest.json permissions
- Reload extension

**"Message validation failed"**
- Message type mismatch
- Check background console for details

---

## What Should Work

Based on the implementation, these features are ready:

✅ **Core Scanning**
- axe-core integration
- WCAG 2.0/2.1/2.2 rules
- All severity levels
- Element context extraction

✅ **UI Display**
- Side panel interface
- Issue list with grouping
- Issue detail view
- Severity color coding
- WCAG level badges

✅ **Recommendations**
- Role-specific guidance
- Code examples
- Priority levels
- Multiple recommendations per issue

✅ **Data Management**
- Chrome storage integration
- Scan history (last 10 per URL)
- Issue status tracking
- Notes per issue

✅ **Export**
- JSON export
- Download as file
- Structured data format
- Metadata inclusion

---

## What Doesn't Work Yet

These features are planned but not implemented:

❌ **Visual Highlights** (Phase 4)
- No colored borders on page elements
- No tooltips on hover
- No element picker mode

❌ **Filters & Search** (Phase 5)
- No filter dropdowns
- No search box
- Can't filter by severity/WCAG/status

❌ **Manual Checklists** (Phase 6)
- Checklist templates exist in code
- No UI to complete them
- Not included in export

❌ **Settings** (Phase 7)
- No settings page
- No first-run experience
- No analytics opt-in

---

## Expected Performance

**Scan Times:**
- Simple page (example.com): ~500ms
- Medium page (Wikipedia): ~1-2 seconds
- Complex page (GitHub): ~2-3 seconds
- Very large page: ~3-5 seconds

**Issue Counts (typical):**
- Well-designed site: 0-10 issues
- Average site: 10-50 issues
- Problematic site: 50-200+ issues

**Memory Usage:**
- Extension: ~50-100 MB
- Per scan: ~5-10 MB storage

---

## Success Criteria

The test is successful if:

1. ✅ Extension loads without errors
2. ✅ Side panel opens and displays UI
3. ✅ Scan executes and completes
4. ✅ Issues appear in the list
5. ✅ Issue details show correctly
6. ✅ Recommendations are readable
7. ✅ Export downloads valid JSON
8. ✅ No console errors during normal use

---

## Reporting Issues

If you find bugs or unexpected behavior:

### 1. Check Console Logs

**Side Panel Console:**
```
Right-click side panel → Inspect → Console
```

**Page Console:**
```
F12 → Console (or right-click page → Inspect)
```

**Background Worker:**
```
chrome://extensions → Accessibility Audit → Inspect views: service worker
```

### 2. Capture Error Details

- Full error message
- Console stack trace
- Steps to reproduce
- URL of tested page
- Chrome version

### 3. Document in TODO.md

Add to the "Known Issues" section with:
- Clear title
- Description
- How to reproduce
- Console errors
- Expected vs actual behavior

---

## Next Steps After Testing

### If Everything Works

1. ✅ Mark Phases 1-3 as tested and working
2. 🚀 Start Phase 4 (Element Highlighting)
3. 📝 Update IMPLEMENTATION_STATUS.md

### If Issues Found

1. 🐛 Document in TODO.md
2. 🔍 Debug using console logs
3. 🔧 Fix critical issues
4. ✅ Re-test

### Priority Fixes

If you encounter these, fix them first:
- Scan doesn't complete
- No issues display (but should)
- Extension crashes
- Export fails
- Console errors on every scan

---

## Development Server

The dev server is currently running in the background:
- **Process ID:** Check terminal
- **Port:** Vite default (5173)
- **Watch mode:** ✅ Enabled
- **Auto-rebuild:** ✅ Active

### To stop the server:
```bash
# Find the process
ps aux | grep vite

# Or just close the terminal window
```

### To restart:
```bash
cd /Users/iggyvillamar/Documents/REPOS/accessibility-extension
pnpm run dev
```

---

## Build Status Summary

**Build:** ✅ Success
**Type Check:** ✅ Pass
**Dependencies:** ✅ Installed (234 packages)
**Dev Server:** ✅ Running
**Extension Ready:** ✅ Yes

**Location:** `/Users/iggyvillamar/Documents/REPOS/accessibility-extension/dist`

**Load in Chrome:** `chrome://extensions/` → Load unpacked → Select `dist` folder

---

Good luck with testing! 🚀
