# TODO - Immediate Next Steps

## Phase 0: Setup & Testing (Start Here)

### Installation
- [ ] Run `npm install`
- [ ] Verify no errors during installation
- [ ] Check `node_modules` exists and populated

### Build & Load
- [ ] Run `npm run dev`
- [ ] Verify `dist/` folder is created
- [ ] Check for TypeScript compilation errors
- [ ] Load extension in Chrome at `chrome://extensions/`
- [ ] Verify extension appears in list

### First Test
- [ ] Navigate to https://webaim.org/articles/
- [ ] Click extension icon to open side panel
- [ ] Click "Run Scan" button
- [ ] Verify scan completes without errors
- [ ] Check issues appear in list
- [ ] Select an issue and view details
- [ ] Test export functionality
- [ ] Verify JSON file downloads

### Debug If Needed
- [ ] Check side panel console for errors
- [ ] Check page console for content script logs
- [ ] Check background console for service worker logs
- [ ] Fix any critical errors preventing basic functionality

## Phase 4: Element Highlighting (High Priority)

### Overlay System
- [ ] Create `src/contentScripts/overlay.ts`
- [ ] Implement `createHighlight(issue: Issue)` function
- [ ] Add color coding by severity:
  - Critical: red border
  - Serious: orange border
  - Moderate: yellow border
  - Minor: blue border
- [ ] Handle z-index management (overlays above content)
- [ ] Implement `clearHighlights()` function
- [ ] Test on complex pages (overlapping elements)

### Highlight Management
- [ ] Listen for HIGHLIGHT_ISSUE messages
- [ ] Listen for CLEAR_HIGHLIGHTS messages
- [ ] Update content script to render highlights
- [ ] Add smooth scrolling to highlighted element
- [ ] Add pulse animation on first highlight

### Tooltip System
- [ ] Create `src/contentScripts/tooltip.ts`
- [ ] Show issue title + severity on hover
- [ ] Position tooltip near element (avoid overflow)
- [ ] Add click to open side panel detail
- [ ] Style tooltip consistently with side panel

### Side Panel Integration
- [ ] Update IssueList to send HIGHLIGHT_ISSUE on click
- [ ] Update IssueDetail to highlight selected issue
- [ ] Add "Highlight on page" button
- [ ] Clear highlights when scan completes
- [ ] Clear highlights when side panel closes

## Phase 4.5: Element Picker (Medium Priority)

### Picker Mode
- [ ] Create `src/contentScripts/picker.ts`
- [ ] Implement hover effect showing selector path
- [ ] Add click handler to select element
- [ ] Send INSPECT_ELEMENT message to side panel
- [ ] Add escape key to exit picker mode

### UI Controls
- [ ] Add "Pick Element" button in side panel
- [ ] Show picker status (active/inactive)
- [ ] Display selected element info
- [ ] Show all issues for selected element
- [ ] Add cursor change during picker mode

## Phase 5: Filtering & Search (Medium Priority)

### Filter UI
- [ ] Add filter dropdowns in Header
- [ ] Severity filter (multi-select)
- [ ] WCAG level filter (A, AA, AAA)
- [ ] Status filter (open, fixed, ignored, etc.)
- [ ] Wire filters to ScanContext
- [ ] Test filtered lists update correctly

### Search
- [ ] Add search input in Header
- [ ] Debounce search input (300ms)
- [ ] Search in title, description, ruleId
- [ ] Highlight search matches (optional)
- [ ] Add "Clear filters" button

### Filter Persistence
- [ ] Save filters to chrome.storage.local
- [ ] Load filters on panel open
- [ ] Add "Reset to default" option

## Phase 6: Manual Checklists (Medium Priority)

### Checklist UI
- [ ] Create `src/sidepanel/components/ChecklistView.tsx`
- [ ] Use Accordion for categories
- [ ] Add Pass/Fail/Skip buttons per item
- [ ] Add notes textarea per item
- [ ] Show completion percentage
- [ ] Style consistently with rest of UI

### Checklist Management
- [ ] Load DEFAULT_CHECKLISTS on first use
- [ ] Load saved checklist for current URL
- [ ] Save checklist on changes
- [ ] Mark checklist as complete when all items done
- [ ] Add to Header navigation (tab or button)

### Export Integration
- [ ] Include checklist in JSON export
- [ ] Show checklist summary in export dialog
- [ ] Add "Export with checklist" option

## Phase 7: Polish & UX (Lower Priority)

### Loading States
- [ ] Add skeleton screens for issue list
- [ ] Add spinner during scan
- [ ] Add progress indicator (if possible)
- [ ] Disable UI during scan

### Error Handling
- [ ] Add React Error Boundaries
- [ ] Show user-friendly error messages
- [ ] Add retry buttons for failed scans
- [ ] Log errors for debugging

### Keyboard Navigation
- [ ] Add keyboard shortcuts (Ctrl+K for search)
- [ ] Arrow keys to navigate issue list
- [ ] Enter to select issue
- [ ] Escape to close dialogs
- [ ] Tab focus management

### Settings Page
- [ ] Create settings page
- [ ] Analytics opt-in toggle
- [ ] Clear all data button
- [ ] Export/import settings
- [ ] About section with version info

### First Run Experience
- [ ] Detect first install
- [ ] Show welcome screen
- [ ] Quick tutorial (optional)
- [ ] Set firstRunComplete flag

## Bug Fixes & Improvements

### Known Issues to Fix
- [ ] Icons are placeholders - create proper PNG files
- [ ] Remove unused imports
- [ ] Fix any TypeScript `any` types
- [ ] Add loading states where missing
- [ ] Improve error messages

### Code Quality
- [ ] Add JSDoc comments to public functions
- [ ] Write unit tests for scanner.ts
- [ ] Write unit tests for storage.ts
- [ ] Add PropTypes or Zod validation for components
- [ ] Run linter and fix issues

### Performance
- [ ] Profile scan time on large pages
- [ ] Optimize re-renders in IssueList
- [ ] Add virtualization if >100 issues
- [ ] Lazy load recommendation tabs
- [ ] Optimize storage operations

## Documentation

### User Documentation
- [ ] Create USER_GUIDE.md
- [ ] Add screenshots of UI
- [ ] Document common workflows
- [ ] FAQ section
- [ ] Troubleshooting for users

### Developer Documentation
- [ ] Add more code comments
- [ ] Document message flow
- [ ] Document storage schema
- [ ] Add architecture diagrams
- [ ] Contributing guide

## Testing

### Manual Testing
- [ ] Test on 10+ different websites
- [ ] Test with pages with 0 issues
- [ ] Test with pages with 100+ issues
- [ ] Test with slow-loading pages
- [ ] Test with SPAs (React, Vue apps)
- [ ] Test with iframes
- [ ] Test export on large scans
- [ ] Test storage limits (near 10MB)

### Automated Testing
- [ ] Set up test framework (Vitest or Jest)
- [ ] Write unit tests for scanner
- [ ] Write unit tests for storage
- [ ] Write unit tests for messaging
- [ ] Write integration tests
- [ ] Set up E2E tests (Playwright)

### Browser Testing
- [ ] Test in Chrome stable
- [ ] Test in Chrome beta
- [ ] Test in Edge
- [ ] Test in Brave
- [ ] (Future) Test in Firefox with adapted manifest

## Release Preparation

### Pre-Release Checklist
- [ ] All critical features working
- [ ] No console errors on test sites
- [ ] Export produces valid JSON
- [ ] Documentation is complete
- [ ] README has clear instructions
- [ ] Screenshots/demo video created

### Chrome Web Store (Optional)
- [ ] Create store assets (screenshots, promo images)
- [ ] Write store description
- [ ] Set up developer account
- [ ] Create privacy policy
- [ ] Submit for review

## Future Features (Post v1.0)

### v1.1 Features
- [ ] HTML export format
- [ ] Markdown export format
- [ ] Custom rule configuration
- [ ] Firefox support
- [ ] Improved diff visualization

### v1.2 Features
- [ ] Auto re-scan on DOM changes
- [ ] Issue annotations/comments
- [ ] Team sharing features
- [ ] Historical trending
- [ ] Bulk operations

### v2.0 Features
- [ ] AI-powered fix suggestions
- [ ] Integration with issue trackers
- [ ] Scheduled scans
- [ ] Report templates
- [ ] Advanced analytics

## Notes

**Current Status:** Phases 1-3 complete (core functionality)
**Next Priority:** Test in browser, then implement highlighting (Phase 4)
**Target:** v1.0 release with all Phase 4-7 features

**Estimated Time to v1.0:**
- Phase 4 (Highlighting): 8-12 hours
- Phase 5 (Filters): 4-6 hours
- Phase 6 (Checklists): 6-8 hours
- Phase 7 (Polish): 8-10 hours
- Testing & Fixes: 10-15 hours
- **Total: 36-51 hours of focused development**

**Quick Wins:**
1. Get it running in browser (immediate)
2. Add highlighting (high user value)
3. Add filters (high usability value)
4. Polish error states (professional feel)

**Can Skip for v1.0:**
- Element picker (nice to have)
- Settings page (can hardcode for now)
- First-run experience (not critical)
- Analytics (can add later)
