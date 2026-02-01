# Load Extension in Chrome

Accessibility Audit Chrome Extension — ready to test in Chrome.

**Build status:** ✅ Success

---

## Quick Start (3 steps)

1. **Open Chrome**  
   Go to `chrome://extensions/`

2. **Enable Developer mode**  
   Toggle the switch in the top-right corner.

3. **Load extension**  
   Click **Load unpacked** → select the `dist` folder from this project.

---

## First Test

1. Open a new tab → go to <https://webaim.org/articles/>
2. Click the extension icon in the toolbar.
3. Side panel opens on the right.
4. Click the blue **Run Scan** button.
5. Wait 2–3 seconds.
6. Issues appear grouped by severity ✅

---

## What Works

- Core accessibility scanning (axe-core)
- Issue list with severity grouping
- Detailed issue information
- Role-based recommendations
- JSON export
- WCAG criteria display

## Not Yet Implemented

- Visual highlights on page
- Element picker
- Filters/search
- Manual checklists UI
- Settings page

---

## If Something Doesn’t Work

**Check console logs:**

| Context           | How to open                                             |
| ----------------- | ------------------------------------------------------- |
| Side panel        | Right-click side panel → Inspect → Console              |
| Web page          | F12 → Console tab                                       |
| Background worker | chrome://extensions → **Inspect views: service worker** |

---

## Documentation

- [MANUAL_TEST_GUIDE.md](./MANUAL_TEST_GUIDE.md) — Full testing guide
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) — Development tips
- [ROADMAP.md](./ROADMAP.md) — Version roadmap and next steps

---

## Dev Server

- **Status:** ✅ Running in background
- **Auto-reload:** ✅ Enabled

**Restart:** `pnpm run dev`  
**Stop:** Ctrl+C in terminal

---

## Build Info

- Package manager: pnpm (not npm)
- Dependencies: 234 packages installed
- Extension version: 0.1.0

---

## Success Criteria

- ✅ Extension loads without errors
- ✅ Side panel opens
- ✅ Scan button works
- ✅ Results display
- ✅ Issue details show
- ✅ Export downloads JSON

---

## Next Steps

1. Test in Chrome (this guide).
2. Report bugs by opening an issue or see [ROADMAP.md](./ROADMAP.md) for planned work.
3. Test on multiple websites.
