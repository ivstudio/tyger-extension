# Refresh Button – Implementation and Test Plan

## Overview

- Replace header "Run Scan" with a **Refresh** button that clears current scan state and goes **directly to the scanning animation** (no EmptyState).
- **Re-run axe-core**: send `SCAN_REQUEST` so the content script runs axe again; state updates with new results via `SCAN_COMPLETE`.
- Add **comprehensive tests** for new behavior and **regression coverage** so existing behavior is not broken.

---

## Implementation Summary

1. **Reducer**: New action `RESET_AND_START_SCAN` (payload: url) – clears scan data, sets `isScanning: true`, `hasScannedOnce: true`, `currentUrl`; does not use full `initialState`.
2. **useScanWithAnimation**: Add `handleRefresh` – get tab, dispatch `RESET_AND_START_SCAN`, set animation refs, send `SCAN_REQUEST`.
3. **ScanActionsContext**: New context providing `handleScan` and `handleRefresh`; `useScanActions()` hook.
4. **MainView**: Provide `{ handleScan, handleRefresh }` via provider; keep `onScan={handleScan}` for EmptyState.
5. **HeaderActions**: Use `useScanActions().handleRefresh`; Refresh icon + "Refresh" label; remove duplicate scan logic.

---

## Testing Plan

### 1. Reducer: `RESET_AND_START_SCAN`

**File:** `src/app/context/scanReducer.test.ts`

Add a `describe('RESET_AND_START_SCAN')` block (same style as existing `RESET` and `SCAN_START` blocks):

- **Clears scan-related state:** Given state with `currentScan`, `previousScan`, `selectedIssue`, `filters`, `error` – after `RESET_AND_START_SCAN` with payload url:
    - `currentScan` is `null`
    - `previousScan` is `null`
    - `selectedIssue` is `null`
    - `error` is `null`
    - `filters` equals `initialState.filters`
- **Sets scanning state:** `isScanning` is `true`, `hasScannedOnce` is `true`, `currentUrl` is the payload url.
- **Does not show EmptyState:** `hasScannedOnce` must remain `true` (never reset to `false`).
- **Preserves other state:** `currentChecklist`, `viewMode` unchanged (or explicitly defined in reducer spec).
- **From initialState:** Calling `RESET_AND_START_SCAN` from `initialState` still yields `hasScannedOnce: true`, `isScanning: true`, `currentUrl: payload`.

Use existing patterns: `createMockScanResult()`, `createMockManualChecklist()`, `initialState`, and assert on `nextState` like in `RESET` and `SCAN_START` tests.

---

### 2. Regression: Existing `RESET` behavior

**File:** `src/app/context/scanReducer.test.ts`

- **Do not change** the existing `describe('RESET')` tests. Ensure they still pass: full reset to `initialState` (including `hasScannedOnce: false`) must remain as-is for URL change / other flows that use `RESET`.
- Run the full reducer test suite after adding `RESET_AND_START_SCAN` to confirm no regressions.

---

### 3. useScanWithAnimation: handleRefresh

**File:** `src/app/hooks/useScanWithAnimation.test.ts` (new)

Add a test file that mocks `chrome.tabs.query`, `sendMessage`, and `useScanDispatch` (similar to `useTabUrlSync.test.tsx`):

- **handleRefresh dispatches RESET_AND_START_SCAN:** When `handleRefresh` is called, the mock dispatch receives `{ type: 'RESET_AND_START_SCAN', payload: url }` with the active tab url.
- **handleRefresh sends SCAN_REQUEST:** `sendMessage` is called with `type: MessageType.SCAN_REQUEST` and `data: { url, runId }` (axe re-run).
- **handleRefresh sets isAnimating:** After calling `handleRefresh`, the hook’s `isAnimating` becomes `true` (so the animation screen shows).
- **No active tab:** When there is no active tab or url, handleRefresh should not dispatch `RESET_AND_START_SCAN` and should set error (or no-op) and not send `SCAN_REQUEST`.
- **handleScan unchanged:** Existing behavior of `handleScan` (dispatch `SCAN_START`, send `SCAN_REQUEST`, set animation) is unchanged; add or keep a test that asserts `SCAN_START` and `SCAN_REQUEST` for `handleScan` if not already covered elsewhere.

Use the same mock patterns as in `useTabUrlSync.test.tsx` (e.g. `mockChrome`, `resetChromeMocks`, mock `useScanDispatch` with a capture mock).

---

### 4. ScanActionsContext: useScanActions

**File:** `src/app/context/ScanActionsContext.test.tsx` (new)

- **Returns handleScan and handleRefresh inside provider:** When a component is wrapped in `ScanActionsProvider` with value `{ handleScan, handleRefresh }`, `useScanActions()` returns both and they are functions.
- **Throws outside provider:** When `useScanActions()` is used without a surrounding `ScanActionsProvider`, it throws (e.g. "useScanActions must be used within ScanActionsProvider" or similar).

Use `renderHook` from `@testing-library/react` and a wrapper that includes the provider.

---

### 5. HeaderActions: Refresh button

**File:** `src/app/components/Header/HeaderActions.test.tsx` (new)

- **Refresh button calls handleRefresh on click:** Mock `useScanActions()` to return `{ handleRefresh: mockHandleRefresh }`; render `HeaderActions`; click the Refresh button; assert `mockHandleRefresh` was called once.
- **Refresh button disabled when isScanning:** When `useScanState()` returns `isScanning: true`, the Refresh button has `disabled={true}` (or is disabled).
- **Shows "Refresh" and "Scanning...":** When not scanning, button text/label includes "Refresh"; when scanning, includes "Scanning..." (or equivalent).
- **No duplicate scan logic:** Assert that the header does not call `sendMessage` with `SCAN_REQUEST` directly (only via `handleRefresh` from context). Alternatively, ensure there is no local `handleScan` that uses `chrome.tabs.query` + `sendMessage` in HeaderActions.

Mock `useScanActions`, `useScanState`, `useChecklist` as needed; use `render` and `screen` from Testing Library.

---

### 6. Integration / Regression: Existing flows

- **EmptyState still starts scan:** The flow where MainView passes `onScan={handleScan}` to EmptyState is unchanged. No test file may exist for MainView; at minimum, run the full test suite and manually smoke-test: open app, click "Start Accessibility Scan" from empty state, confirm scan runs and results show.
- **useClearHighlights:** Tests in `useClearHighlights.test.tsx` that dispatch `SCAN_START` must still pass. No changes to those tests unless we change how `SCAN_START` is used.
- **useTabUrlSync:** Tests that assert `RESET` when URL changes must still pass; we are not changing `RESET` or useTabUrlSync.
- **Full suite:** Run `pnpm test:run` and `pnpm test:coverage` after all changes; fix any failing tests and ensure coverage thresholds still pass.

---

## Test Checklist (before merge)

- [ ] `scanReducer.test.ts`: New `RESET_AND_START_SCAN` tests added; all existing `RESET` and other reducer tests still pass.
- [ ] `useScanWithAnimation.test.ts`: New file; handleRefresh dispatches correct action, sends SCAN_REQUEST, sets animation; handleScan behavior unchanged.
- [ ] `ScanActionsContext.test.tsx`: New file; useScanActions returns value in provider and throws outside.
- [ ] `HeaderActions.test.tsx`: New file; Refresh button calls handleRefresh, disabled when isScanning, correct labels.
- [ ] `pnpm test:run` passes.
- [ ] `pnpm test:coverage` meets thresholds (no regression).
- [ ] Manual check: EmptyState "Start Accessibility Scan" still runs axe and shows results.
- [ ] Manual check: Header "Refresh" clears results, shows animation, then shows new axe results.
