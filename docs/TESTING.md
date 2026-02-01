# Testing Guide

## Overview

This project uses comprehensive testing infrastructure to ensure code quality and prevent regressions.

## Tech Stack

- **Test Framework**: Vitest 4.0.17
- **Test Environment**: happy-dom (fast, lightweight DOM implementation)
- **Coverage**: v8 (built into Node.js)
- **React Testing**: @testing-library/react
- **Mocking**: Built-in Vitest mocks + custom Chrome API mocks

## Running Tests

```bash
# Run all tests once
pnpm test:run

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Run specific test file
pnpm test scanner.test.ts
```

## Test Structure

```
src/
├── test/
│   ├── setup.ts                     # Global test setup
│   ├── mocks/
│   │   ├── chrome.ts                # Chrome Extension API mocks
│   │   └── axe.ts                   # axe-core mocks
│   ├── fixtures/
│   │   ├── issues.ts                # Sample issue data
│   │   ├── scanResults.ts           # Sample scan data
│   │   ├── checklists.ts            # Sample checklist data
│   │   └── index.ts
│   └── utils/
│       ├── renderWithProviders.tsx  # React testing wrapper
│       └── testHelpers.ts           # Utility functions
│
├── services/
│   ├── scanner.ts
│   ├── scanner.test.ts              # ✅ 13 tests
│   ├── storage.ts
│   ├── storage.test.ts              # ✅ 25 tests
│   ├── messaging.test.ts
│   └── ...
│
└── app/
    └── context/
        ├── scanReducer.ts
        └── scanReducer.test.ts      # ✅ 28 tests (all 11 actions)
```

## Coverage Requirements

### Overall Project

- **Lines**: 80%
- **Statements**: 80%
- **Functions**: 75%
- **Branches**: 75%

### Critical Files (Higher Standards)

- **scanner.ts**: 90% lines/statements
- **storage.ts**: 90% lines/statements
- **scanReducer.ts**: 95% lines/statements, 100% functions

### Components

- **UI Components**: 70% (integration-focused)
- **Worker/Content Scripts**: 70%

## Writing Tests

### Service Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { mockChromeStorage, resetChromeMocks } from '@/test/mocks/chrome';
import { createMockScanResult } from '@/test/fixtures';
import * as storage from './storage';

describe('storage', () => {
    beforeEach(() => {
        resetChromeMocks();
    });

    it('should save scan result', async () => {
        const scan = createMockScanResult({ url: 'https://example.com' });
        await storage.saveScanResult(scan);

        const results = await storage.getScanResultsForUrl(
            'https://example.com'
        );
        expect(results).toHaveLength(1);
    });
});
```

### Reducer Tests

```typescript
import { scanReducer } from './scanReducer';
import { initialState } from './scanTypes';

describe('scanReducer', () => {
    it('should handle SCAN_START', () => {
        const nextState = scanReducer(initialState, { type: 'SCAN_START' });
        expect(nextState.isScanning).toBe(true);
    });
});
```

### Component Tests

```typescript
import { render, screen } from '@/test/utils/renderWithProviders';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('should render all filter controls', () => {
    render(<FilterBar />);
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });
});
```

## Test Utilities

### Fixtures

```typescript
import {
    createMockScanResult,
    createMockIssue,
    mockIssues,
} from '@/test/fixtures';

// Create a scan with default values
const scan = createMockScanResult();

// Create a scan with custom properties
const customScan = createMockScanResult({
    url: 'https://example.com',
    timestamp: 123456,
    issues: [mockColorContrastIssue, mockMissingAltIssue],
});

// Create individual issue
const issue = createMockIssue({
    ruleId: 'color-contrast',
    impact: 'serious',
});
```

### Chrome API Mocks

```typescript
import { mockChromeStorage, resetChromeMocks } from '@/test/mocks/chrome';

// Pre-populate Chrome storage
mockChromeStorage({
    scan_results: { 'https://example.com': [scan1, scan2] },
});

// Reset all mocks between tests
beforeEach(() => {
    resetChromeMocks();
});
```

### Test Helpers

```typescript
import {
    flushPromises,
    waitFor,
    createDeferred,
} from '@/test/utils/testHelpers';

// Flush all pending promises
await flushPromises();

// Wait for condition
await waitFor(() => element.textContent === 'Loaded');

// Create deferred promise for async testing
const { promise, resolve } = createDeferred<string>();
```

## CI/CD Integration

Tests run automatically on:

- Every push to `main`
- Every pull request
- Manual workflow dispatch

### GitHub Actions Workflow

```yaml
- name: Run tests with coverage
  run: pnpm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
      files: ./coverage/coverage-final.json,./coverage/lcov.info
```

## Pre-commit Hooks

Tests related to staged files run automatically via Husky and lint-staged:

```json
{
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

## Best Practices

### Do's ✅

- **Test behavior, not implementation**: Focus on what the code does, not how it does it
- **Use descriptive test names**: `should update issue status when action is dispatched`
- **Keep tests focused**: One assertion per test (when possible)
- **Use fixtures**: Reuse mock data across tests
- **Reset mocks**: Use `beforeEach` to ensure test isolation
- **Test edge cases**: Null values, empty arrays, missing data
- **Test immutability**: Verify state doesn't mutate

### Don'ts ❌

- **Don't test implementation details**: Avoid testing private functions directly
- **Don't duplicate tests**: If logic is tested in unit tests, don't re-test in integration
- **Don't use real Chrome APIs**: Always use mocks for browser APIs
- **Don't rely on test order**: Each test should be independent
- **Don't ignore coverage warnings**: Investigate uncovered branches

## Debugging Tests

### Run Single Test

```bash
# Run specific test file
pnpm test scanner.test.ts

# Run specific test by name
pnpm test -t "should save scan result"
```

### Debug Mode

```bash
# Run with Node debugger
node --inspect-brk ./node_modules/.bin/vitest run
```

### UI Mode

```bash
# Launch Vitest UI for visual debugging
pnpm test:ui
```

### Check Coverage

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML coverage report
open coverage/index.html
```

## Troubleshooting

### Tests hanging

- Check for unclosed promises
- Verify all async operations use `await`
- Ensure mocks are properly reset

### Chrome API errors

- Verify `resetChromeMocks()` is called in `beforeEach`
- Check that Chrome API methods are mocked in `src/test/mocks/chrome.ts`

### DOM not available

- Ensure test environment is set to `happy-dom` in `vitest.config.ts`
- Verify `setupFiles` includes `src/test/setup.ts`

### Coverage not meeting thresholds

- Run `pnpm test:coverage` to see uncovered lines
- Add tests for missing branches
- Check if file should be excluded in `vitest.config.ts`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [Chrome Extension Testing](https://github.com/webext-core/fake-browser)
