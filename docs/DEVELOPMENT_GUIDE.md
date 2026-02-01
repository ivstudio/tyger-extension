# Development Guide

Quick reference for common development tasks.

## Quick Commands

```bash
# Install dependencies
npm install

# Development mode (watch + rebuild)
npm run dev

# Type checking only (no build)
npm run type-check

# Production build
npm run build

# Preview production build
npm run preview
```

## Development Workflow

### 1. Start Development Session

```bash
# Terminal 1: Start dev server
cd /Users/iggyvillamar/Documents/REPOS/accessibility-extension
npm run dev

# Keep this running - it watches for changes
```

### 2. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder
5. Note the extension ID for debugging

### 3. Make Changes

Edit any file in `src/`:
- Changes to React components → HMR (instant update)
- Changes to content/background scripts → Manual refresh needed

### 4. Test Changes

**For side panel changes:**
- Just reload the side panel (changes appear immediately with HMR)

**For content script changes:**
1. Go to `chrome://extensions/`
2. Click refresh icon on extension
3. Reload the web page you're testing

**For background worker changes:**
1. Go to `chrome://extensions/`
2. Click refresh icon on extension
3. May need to disable/enable extension

### 5. Debug

**Side Panel Console:**
```
Right-click side panel → Inspect → Console tab
```

**Content Script Console:**
```
Right-click web page → Inspect → Console tab
(Look for "Accessibility Audit content script loaded")
```

**Background Worker Console:**
```
chrome://extensions/ → Extension → "Inspect views: service worker"
```

## File Editing Patterns

### Adding a New UI Component

1. Create component directory and files:
```bash
mkdir src/sidepanel/components/MyComponent
touch src/sidepanel/components/MyComponent/MyComponent.tsx
touch src/sidepanel/components/MyComponent/index.ts
```

2. Write component:
```typescript
// MyComponent/MyComponent.tsx
import { Button } from '../ui/button';

export function MyComponent() {
  return (
    <div className="p-4">
      <Button>Click me</Button>
    </div>
  );
}
```

3. Export from index.ts:
```typescript
// MyComponent/index.ts
export { MyComponent } from './MyComponent';
```

4. Import and use:
```typescript
import { MyComponent } from './components/MyComponent';

// In your JSX:
<MyComponent />
```

**Component Organization:**
- Directory name matches component name (PascalCase)
- One component per file for maintainability
- Related helper components in the same directory
- index.ts provides clean import path

### Adding a New Message Type

1. Define in `src/types/messages.ts`:
```typescript
export const MyMessageSchema = z.object({
  type: z.literal('MY_MESSAGE'),
  data: z.object({
    myField: z.string()
  })
});

// Add to union
export const MessageSchema = z.discriminatedUnion('type', [
  // ... existing schemas
  MyMessageSchema
]);

export type MyMessage = z.infer<typeof MyMessageSchema>;
```

2. Add to MessageType enum:
```typescript
export const MessageType = {
  // ... existing types
  MY_MESSAGE: 'MY_MESSAGE'
} as const;
```

3. Use it:
```typescript
import { sendMessage } from '@/lib/messaging';
import { MessageType } from '@/types/messages';

await sendMessage({
  type: MessageType.MY_MESSAGE,
  data: { myField: 'value' }
});
```

### Adding a New Type

1. Add to appropriate file in `src/types/`:
```typescript
// src/types/issue.ts
export interface MyNewType {
  id: string;
  name: string;
  // ... fields
}
```

2. Import and use:
```typescript
import { MyNewType } from '@/types/issue';

const myData: MyNewType = {
  id: '123',
  name: 'Example'
};
```

### Adding a New Utility Function

1. Add to `src/lib/utils.ts` or create new file:
```typescript
// src/lib/myUtils.ts
export function myUtilityFunction(input: string): string {
  return input.toUpperCase();
}
```

2. Import and use:
```typescript
import { myUtilityFunction } from '@/lib/myUtils';

const result = myUtilityFunction('hello');
```

## Common Tasks

### Add a New shadcn/ui Component

shadcn/ui components are already included. To add more:

1. Find component at https://ui.shadcn.com/docs/components
2. Copy the component code
3. Create file in `src/sidepanel/components/ui/`
4. Paste and adjust imports

Example - adding Dialog component:
```bash
# Create file
touch src/sidepanel/components/ui/dialog.tsx

# Copy code from shadcn/ui docs
# Paste into dialog.tsx
# Adjust imports to use @/ alias
```

### Add a New Scan Rule

Custom rules beyond axe-core:

1. Add to `src/lib/scanner.ts`:
```typescript
async function runCustomRules(document: Document): Promise<Issue[]> {
  const issues: Issue[] = [];

  // Your custom check
  const problematicElements = document.querySelectorAll('.my-selector');
  problematicElements.forEach(element => {
    issues.push({
      id: generateId(),
      source: 'custom',
      ruleId: 'custom-rule-id',
      title: 'Custom Rule Title',
      // ... rest of Issue fields
    });
  });

  return issues;
}
```

2. Call in `runScan()`:
```typescript
export async function runScan(): Promise<ScanResult> {
  // ... existing axe-core scan

  // Add custom rules
  const customIssues = await runCustomRules(document);
  issues.push(...customIssues);

  // ... rest of function
}
```

### Add Storage for New Data

1. Define type in `src/types/`:
```typescript
export interface MyData {
  id: string;
  value: string;
}
```

2. Add storage functions in `src/lib/storage.ts`:
```typescript
const STORAGE_KEYS = {
  // ... existing
  MY_DATA: 'my_data'
} as const;

export async function saveMyData(data: MyData): Promise<void> {
  await browser.storage.local.set({
    [STORAGE_KEYS.MY_DATA]: data
  });
}

export async function getMyData(): Promise<MyData | null> {
  const result = await browser.storage.local.get(STORAGE_KEYS.MY_DATA);
  return result[STORAGE_KEYS.MY_DATA] || null;
}
```

3. Use it:
```typescript
import { saveMyData, getMyData } from '@/lib/storage';

await saveMyData({ id: '1', value: 'test' });
const data = await getMyData();
```

## Debugging Tips

### TypeScript Errors

```bash
# Check for type errors without building
npm run type-check

# Common issues:
# - Missing import
# - Type mismatch
# - Undefined property
```

### Runtime Errors

**Check all three consoles:**
1. Side panel console (UI errors)
2. Page console (content script errors)
3. Background console (service worker errors)

**Common errors:**
- "Cannot read property of undefined" → Check null/undefined handling
- "Module not found" → Check import path, might need @/ alias
- "Chrome API not available" → Check permissions in manifest.json

### Message Not Received

**Debug messaging:**

1. Add logs in sender:
```typescript
console.log('Sending message:', message);
await sendMessage(message);
console.log('Message sent');
```

2. Add logs in receiver:
```typescript
onMessage((message) => {
  console.log('Received message:', message);
  // handle message
});
```

3. Check background console - it routes all messages

**Common issues:**
- Message type doesn't match schema → Validation fails silently
- No listener registered → Message goes nowhere
- Tab/window closed → Receiver doesn't exist

### Extension Not Loading

**Check manifest.json:**
- Valid JSON (no trailing commas)
- All file paths exist in dist/
- Permissions are correct

**Check build output:**
```bash
# Look for errors in dev server output
npm run dev

# Check dist/ folder exists and has files
ls -la dist/
```

## Performance Optimization

### Measuring Scan Performance

Add timing logs in `src/lib/scanner.ts`:

```typescript
export async function runScan(): Promise<ScanResult> {
  const startTime = performance.now();

  const results = await axe.run(document, { /* ... */ });

  const scanTime = performance.now() - startTime;
  console.log(`Scan completed in ${scanTime.toFixed(2)}ms`);

  // ... rest
}
```

### Optimizing Re-renders

Add React DevTools Profiler:
1. Install React DevTools extension
2. Open side panel console
3. Click "Profiler" tab
4. Record interactions
5. Look for unnecessary re-renders

**Common optimizations:**
- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for event handlers

### Reducing Bundle Size

```bash
# Check bundle size
npm run build
ls -lh dist/sidepanel/assets/

# Analyze what's large:
# - Check for unused dependencies
# - Lazy load heavy components
# - Code-split large modules
```

## Testing Strategies

### Manual Testing Checklist

```
□ Extension loads without errors
□ Side panel opens
□ Scan button works
□ Results display correctly
□ Issue selection works
□ Export downloads JSON
□ Re-scan updates results
□ No console errors
```

### Test on Different Sites

Good variety for testing:
- https://webaim.org/articles/ - Known accessibility issues
- https://github.com - Complex SPA
- https://www.wikipedia.org - Traditional site
- https://example.com - Simple HTML
- Your own projects - Real-world testing

### Edge Cases to Test

```
□ Very large page (1000+ elements)
□ Page with many iframes
□ Single-page app (navigation)
□ Page with errors (404, 500)
□ Page with no issues
□ Page with 100+ issues
□ Slow-loading page
□ Page with dynamic content
```

## Code Style Guide

### TypeScript

```typescript
// ✅ Good: Explicit types
function processIssue(issue: Issue): string {
  return issue.title;
}

// ❌ Bad: Implicit any
function processIssue(issue) {
  return issue.title;
}
```

### React Components

```typescript
// ✅ Good: Typed props
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  return <div onClick={onAction}>{title}</div>;
}

// ❌ Bad: Untyped props
export default function MyComponent({ title, onAction }) {
  return <div onClick={onAction}>{title}</div>;
}
```

### Imports

```typescript
// ✅ Good: Use @ alias for src/
import { Issue } from '@/types/issue';
import { useScanState } from '@/sidepanel/context/ScanContext';

// ❌ Bad: Relative paths
import { Issue } from '../../types/issue';
import { useScanState } from '../context/ScanContext';
```

### Async/Await

```typescript
// ✅ Good: Try-catch for errors
async function doSomething() {
  try {
    const result = await someAsyncFunction();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}

// ❌ Bad: No error handling
async function doSomething() {
  const result = await someAsyncFunction();
  return result;
}
```

## Git Workflow

### Initial Setup

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# First commit
git commit -m "Initial implementation: Phases 1-3 complete

- Project foundation with TypeScript, React, Vite
- Core scanning engine with axe-core
- Side panel UI with issue list and details
- Storage layer with auto-pruning
- Type-safe messaging
- JSON export functionality"
```

### During Development

```bash
# Check status
git status

# Stage changes
git add src/sidepanel/components/MyComponent.tsx

# Commit with descriptive message
git commit -m "Add MyComponent for feature X"

# View history
git log --oneline
```

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/highlighting

# Work on feature...
git add .
git commit -m "Implement element highlighting"

# Merge back to main
git checkout main
git merge feature/highlighting
```

## Environment Variables

Not currently used, but to add:

1. Create `.env.local`:
```bash
VITE_API_ENDPOINT=https://api.example.com
```

2. Access in code:
```typescript
const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
```

3. Add to `.gitignore`:
```
.env.local
```

## Useful Chrome Extension APIs

### Tabs

```typescript
// Get current tab
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

// Execute script
await chrome.scripting.executeScript({
  target: { tabId: tab.id! },
  func: () => console.log('Hello from page')
});
```

### Storage

```typescript
// Set data
await chrome.storage.local.set({ key: 'value' });

// Get data
const result = await chrome.storage.local.get('key');

// Get all data
const allData = await chrome.storage.local.get(null);

// Remove data
await chrome.storage.local.remove('key');

// Clear all
await chrome.storage.local.clear();
```

### Side Panel

```typescript
// Open side panel
await chrome.sidePanel.open({ windowId: window.id });

// Set panel path
await chrome.sidePanel.setOptions({
  path: 'src/sidepanel/index.html'
});
```

## Resources

### Documentation
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/)
- [axe-core API](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zod](https://zod.dev/)

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [axe DevTools](https://www.deque.com/axe/devtools/) (compare results)

### Testing Resources
- [WebAIM](https://webaim.org/) - Accessibility resources
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Deque University](https://dequeuniversity.com/) - Learn accessibility

## Next Steps

After getting the extension working, prioritize:

1. **Test thoroughly** - Load in Chrome, test on multiple sites
2. **Fix bugs** - Address any issues found during testing
3. **Add highlighting** - Implement Phase 4 for visual feedback
4. **Add filters** - Implement severity/WCAG filtering
5. **Polish UI** - Loading states, error messages, keyboard navigation
6. **Write tests** - Unit tests for core functions
7. **Documentation** - User guide for end users

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed roadmap.
