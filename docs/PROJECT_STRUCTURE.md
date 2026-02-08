# Project Structure

Visual guide to the codebase organization.

## Directory Tree

```
accessibility-extension/
│
├── 📁 public/                      # Static assets loaded by extension
│   ├── 📁 icons/                   # Extension icons
│   │   ├── icon.svg                # Source icon (placeholder)
│   │   ├── icon-16.png             # Toolbar icon
│   │   ├── icon-48.png             # Extension management
│   │   └── icon-128.png            # Chrome Web Store
│   └── manifest.json               # Chrome Extension Manifest V3
│
├── 📁 src/                         # Source code
│   │
│   ├── 📁 worker/              # Service Worker (persistent background script)
│   │   └── index.ts                # Message routing, extension lifecycle
│   │
│   ├── 📁 contentScripts/                 # Content Scriptss (runs on web pages)
│   │   └── index.ts                # Scan execution, page interaction
│   │
│   ├── 📁 services/                     # Shared utilities and core logic
│   │   ├── scanner.ts              # axe-core integration, result transformation
│   │   ├── storage.ts              # Chrome storage abstraction, auto-pruning
│   │   ├── messaging.ts            # Type-safe message passing with Zod
│   │   ├── export.ts               # JSON export, download, clipboard
│   │   └── utils.ts                # Utility functions (cn, etc.)
│   │
│   ├── 📁 app/               # React UI (side panel interface)
│   │   │
│   │   ├── 📁 components/          # React components
│   │   │   ├── 📁 ui/              # Base UI components (shadcn/ui)
│   │   │   │   ├── button.tsx      # Button variants
│   │   │   │   ├── badge.tsx       # Badge variants
│   │   │   │   └── tabs.tsx        # Tab components
│   │   │   │
│   │   │   ├── 📁 Header/          # Top bar component
│   │   │   │   ├── Header.tsx      # Scan button, summary
│   │   │   │   └── index.ts        # Component export
│   │   │   │
│   │   │   ├── 📁 IssueList/       # Issue list components
│   │   │   │   ├── IssueList.tsx   # Main list with severity grouping
│   │   │   │   ├── IssueListItem.tsx # Individual issue item
│   │   │   │   └── index.ts        # Component exports
│   │   │   │
│   │   │   ├── 📁 IssueDetail/     # Issue detail components
│   │   │   │   ├── IssueDetail.tsx # Main detail view
│   │   │   │   ├── RecommendationCard.tsx # Recommendation display
│   │   │   │   └── index.ts        # Component exports
│   │   │   │
│   │   │   ├── 📁 EmptyState/      # No results state
│   │   │   │   ├── EmptyState.tsx  # Empty/error display
│   │   │   │   └── index.ts        # Component export
│   │   │   │
│   │   │   └── 📁 ExportDialog/    # Export functionality
│   │   │       ├── ExportDialog.tsx # Export UI
│   │   │       └── index.ts        # Component export
│   │   │
│   │   ├── 📁 context/             # React Context (state management)
│   │   │   └── ScanContext.tsx     # Scan state, filters, selected issue
│   │   │
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # React entry point
│   │   ├── index.html              # HTML entry point
│   │   └── index.css               # Global styles, Tailwind directives
│   │
│   └── 📁 types/                   # TypeScript type definitions
│       ├── issue.ts                # Issue, ScanResult, ScanDiff
│       ├── checklist.ts            # Manual checklist types, templates
│       └── messages.ts             # Message types, Zod schemas
│
├── 📄 Configuration Files
│   ├── package.json                # Dependencies, scripts
│   ├── tsconfig.json               # TypeScript config (strict mode)
│   ├── tsconfig.node.json          # TypeScript for build tools
│   ├── vite.config.ts              # Vite bundler + CRX plugin
│   ├── tailwind.config.js          # Tailwind CSS theme
│   ├── postcss.config.js           # PostCSS config
│   ├── .prettierrc                 # Code formatting
│   ├── .eslintrc.cjs               # Linting rules
│   └── .gitignore                  # Git exclusions
│
├── 📄 Documentation (docs/)
│   ├── README.md                   # Docs index
│   ├── GETTING_STARTED.md          # Setup, install, troubleshooting
│   ├── LOAD_IN_CHROME.md           # Quick load reference
│   ├── MANUAL_TEST_GUIDE.md        # Browser testing
│   ├── DEVELOPMENT_GUIDE.md        # Dev workflow
│   ├── PROJECT_STRUCTURE.md        # This file
│   ├── IMPLEMENTATION_STATUS.md    # Progress tracking
│   ├── ROADMAP.md                  # Version roadmap
│   └── TESTING.md                  # Tests, coverage, CI/CD
│
└── 📁 .vscode/                     # VS Code workspace settings
    └── settings.json               # Editor configuration
```

## File Responsibilities

### Extension Core (3 files)

#### `public/manifest.json`

- Chrome Extension configuration
- Permissions (activeTab, storage, scripting, sidePanel)
- Service worker registration
- Content script injection rules
- Side panel default path

#### `src/worker/index.ts`

- Message routing between content script ↔ side panel
- Extension lifecycle (install, update)
- Side panel management
- **Entry point:** Service worker

#### `src/contentScripts/index.ts`

- Scan execution (calls scanner.ts)
- Listens for scan requests from side panel
- Sends results back to side panel
- **Entry point:** Injected into web pages

### Core Libraries (5 files)

#### `src/services/scanner.ts` (~300 lines)

**Purpose:** Interface with axe-core and transform results

**Key Functions:**

- `runScan()` - Execute axe-core on current page
- `processAxeResults()` - Transform axe violations to Issue format
- `getElementContext()` - Extract accessibility context
- `generateRecommendations()` - Create role-specific guidance
- `calculateContrastRatio()` - WCAG contrast calculation

**Dependencies:** axe-core, dom-accessibility-api

#### `src/services/storage.ts` (~250 lines)

**Purpose:** Manage chrome.storage.local with auto-pruning

**Key Functions:**

- `saveScanResult()` - Save scan with auto-pruning (keep last 10)
- `getScanResults()` - Retrieve all stored scans
- `compareScanResults()` - Generate diff between scans
- `updateIssueStatus()` - Update issue status/notes
- `checkStorageUsage()` - Warn at 80% of 10MB limit

**Storage Schema:**

```typescript
{
  scan_results: { [url]: ScanResult[] },
  manual_checklists: { [url]: ManualChecklist[] },
  settings: Settings
}
```

#### `src/services/messaging.ts`

**Purpose:** Type-safe message passing with validation

**Key Functions:**

- `sendMessage()` - Send message with Zod validation
- `sendMessageToTab()` - Send to specific tab
- `onMessage()` - Listen with type checking
- `getActiveTab()` - Get current active tab
- `openSidePanel()` - Open side panel programmatically

**Message Types:**

- SCAN_REQUEST, SCAN_COMPLETE, SCAN_ERROR
- HIGHLIGHT_ISSUE, CLEAR_HIGHLIGHTS
- TOGGLE_PICKER, INSPECT_ELEMENT
- UPDATE_ISSUE_STATUS, OPEN_SIDEPANEL

#### `src/services/export.ts`

**Purpose:** Export scan results

**Key Functions:**

- `exportAsJSON()` - Convert to JSON with metadata
- `downloadJSON()` - Download as file
- `copyToClipboard()` - Copy to clipboard
- `getEstimatedSize()` - File size estimation

**Export Format:**

```typescript
{
  version: "1.0.0",
  exportDate: ISO string,
  scan: ScanResult,
  checklist?: ManualChecklist,
  metadata: { extensionVersion, browser }
}
```

#### `src/services/utils.ts`

**Purpose:** Utility functions

**Key Functions:**

- `cn()` - Merge Tailwind classes with clsx + tailwind-merge

### Type Definitions (3 files)

#### `src/types/issue.ts`

**Core Types:**

- `Issue` - Single accessibility issue
- `ScanResult` - Complete scan with summary
- `ScanDiff` - Comparison between scans
- `Recommendation` - Role-specific guidance
- `ImpactLevel`, `WCAGLevel`, `IssueStatus` - Enums

#### `src/types/checklist.ts`

**Core Types:**

- `ChecklistItem` - Single checklist item
- `ChecklistCategory` - Group of items
- `ManualChecklist` - Complete checklist for URL
- `DEFAULT_CHECKLISTS` - Pre-defined templates

**Categories:** Keyboard Nav, Screen Reader, Zoom/Reflow, Reduced Motion, Focus Management

#### `src/types/messages.ts`

**Core Types:**

- Message type definitions for all message types
- Zod schemas for runtime validation
- TypeScript types derived from schemas

### React UI (Component-Based Organization)

#### `src/app/main.tsx`

React entry point - renders `<App />` into DOM

#### `src/app/App.tsx`

Main app component:

- Sets up ScanProvider context
- Listens for scan results
- Layout: Header + (IssueList | IssueDetail)

#### `src/app/context/ScanContext.tsx`

State management with useReducer:

- **State:** currentScan, previousScan, selectedIssue, filters, isScanning, error
- **Actions:** SCAN_START, SCAN_COMPLETE, SELECT_ISSUE, UPDATE_FILTERS, etc.
- **Hooks:** useScanState(), useScanDispatch(), useFilteredIssues()

#### `src/app/components/Header/`

Top bar component directory:

- **Header.tsx** - Main header component with title, current URL, scan button, export button, settings button, and summary badges (Critical, Serious, Moderate, Minor counts)
- **index.ts** - Component export

#### `src/app/components/IssueList/`

Issue list component directory:

- **IssueList.tsx** - Main list component showing issues grouped by severity with icons and counts
- **IssueListItem.tsx** - Individual issue item component with WCAG level badges, CSS selectors, and selected state highlighting
- **index.ts** - Component exports

#### `src/app/components/IssueDetail/`

Issue detail component directory:

- **IssueDetail.tsx** - Main detail view showing full issue description, WCAG metadata (level, criteria, impact, confidence), element info (selector, HTML snippet), context (role, accessible name, focusable, contrast), recommendations in tabs (Developer, QA, Designer), status buttons (Fixed, Ignored, Needs Design), notes textarea, and "Learn More" link
- **RecommendationCard.tsx** - Reusable card component for displaying role-specific recommendations
- **index.ts** - Component exports

#### `src/app/components/EmptyState/`

Empty state component directory:

- **EmptyState.tsx** - Shown when no scan results (icon, message, "Run Your First Scan" CTA, error state if scan failed)
- **index.ts** - Component export

#### `src/app/components/ExportDialog/`

Export functionality component directory:

- **ExportDialog.tsx** - Export UI with download JSON button, copy to clipboard button, file size estimate, and export contents summary
- **index.ts** - Component export

#### `src/app/components/ui/`

Base UI components from shadcn/ui:

- `button.tsx` - Button with variants (default, outline, ghost, destructive)
- `badge.tsx` - Badge with variants (default, secondary, outline)
- `tabs.tsx` - Tabs components (Tabs, TabsList, TabsTrigger, TabsContent)
- `input.tsx` - Input component
- `checkbox.tsx` - Checkbox component
- `popover.tsx` - Popover component

Uses Radix UI primitives with Tailwind styling.

**Component Organization:**

- Each component has its own directory matching the component name (PascalCase)
- Multi-component files split into separate files (one component per file)
- index.ts provides clean imports: `import { Header } from './components/Header'`
- Related components colocated for easier maintenance and testing

## Data Flow Diagram

```
┌─────────────────┐
│   User Action   │
│  (Click Scan)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Side Panel    │ ─────► SCAN_REQUEST message
│  (React App)    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Background   │ ─────► Routes message to content script
│  Service Worker │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Content Scripts  │ ─────► Runs axe.run() via scanner.ts
│ (Injected Page) │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   scanner.ts    │ ─────► Transforms results to Issue[]
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Content Scripts  │ ─────► SCAN_COMPLETE message
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Background   │ ─────► Routes to side panel
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Side Panel    │ ─────► Updates state via context
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   storage.ts    │ ─────► Saves to chrome.storage.local
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   IssueList     │ ─────► Renders grouped issues
└─────────────────┘
```

## State Management Flow

```
ScanContext (useReducer)
├── State
│   ├── currentScan: ScanResult | null
│   ├── previousScan: ScanResult | null
│   ├── selectedIssue: Issue | null
│   ├── filters: { severity, wcag, status, search }
│   ├── isScanning: boolean
│   └── error: string | null
│
└── Actions
    ├── SCAN_START → isScanning = true
    ├── SCAN_COMPLETE → update currentScan, save previous
    ├── SCAN_ERROR → set error message
    ├── SELECT_ISSUE → update selectedIssue
    ├── UPDATE_FILTERS → update filter state
    ├── CLEAR_FILTERS → reset filters
    └── UPDATE_ISSUE_STATUS → update issue in currentScan
```

## Build Process

```
Source Files (.ts, .tsx)
         │
         ▼
TypeScript Compiler
         │
         ▼
Vite Bundler
         │
         ▼
@crxjs/vite-plugin
         │
         ▼
dist/ (Chrome Extension)
├── manifest.json
├── worker.js
├── content.js
├── app/
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js
│       └── index-[hash].css
└── icons/
```

## Import Paths

All imports use `@/` alias for `src/`:

```typescript
import { Issue } from '@/types/issue';
import { sendMessage } from '@/services/messaging';
import { useScanState } from '@/app/context/ScanContext';
import { cn } from '@/services/utils';
```

Configured in:

- `tsconfig.json` - `paths: { "@/*": ["./src/*"] }`
- `vite.config.ts` - `resolve.alias: { '@': path.resolve(__dirname, './src') }`

## Key Design Patterns

### 1. Type-Safe Messaging

```typescript
// Define message with Zod schema
const ScanRequestSchema = z.object({
    type: z.literal('SCAN_REQUEST'),
    data: z.object({ url: z.string() }),
});

// Send with validation
sendMessage({ type: 'SCAN_REQUEST', data: { url } });

// Receive with type safety
onMessage(message => {
    if (message.type === 'SCAN_REQUEST') {
        // TypeScript knows message.data.url exists
    }
});
```

### 2. React Context + Reducer

```typescript
// Centralized state management
const [state, dispatch] = useReducer(scanReducer, initialState);

// Components use hooks
const { currentScan } = useScanState();
const dispatch = useScanDispatch();
```

### 3. Separation of Concerns

- **Scanning logic:** services/scanner.ts (pure functions)
- **Storage logic:** services/storage.ts (async functions)
- **UI logic:** app/components/ (React components)
- **Message routing:** worker/index.ts (orchestration)

### 4. Component Composition

```typescript
// Base components
<Button variant="outline" size="sm" />

// Composed components
<Header /> contains <Button>, <Badge>
<IssueList /> contains <IssueListItem>
<IssueDetail /> contains <Tabs>, <Badge>, <Button>
```

## File Naming Conventions

- **Component Directories:** PascalCase matching component name (e.g., `IssueList/`, `Header/`)
- **Component Files:** PascalCase (e.g., `IssueList.tsx`, `IssueListItem.tsx`)
- **Component Exports:** `index.ts` in each component directory
- **Utilities:** camelCase (e.g., `scanner.ts`)
- **Types:** camelCase (e.g., `issue.ts`)
- **UI Primitives:** camelCase (e.g., `button.tsx`)
- **Config:** kebab-case or standard (e.g., `tsconfig.json`)

**Component Organization Pattern:**

```
ComponentName/
├── ComponentName.tsx     # Main component
├── HelperComponent.tsx   # Related helper components
└── index.ts              # Export: export { ComponentName } from './ComponentName'
```

## Entry Points

1. **Background:** `src/worker/index.ts` → Service worker
2. **Content:** `src/contentScripts/index.ts` → Injected into pages
3. **App:** `src/app/index.html` → React app entry

All three run in separate JavaScript contexts and communicate via messages.

## External Dependencies

See [package.json](./package.json) for full list.

**Key Runtime Dependencies:**

- react, react-dom - UI framework
- axe-core - Accessibility scanner
- zod - Schema validation
- @radix-ui/\* - Headless UI components
- lucide-react - Icons
- tailwind-merge, clsx - Class utilities

**Key Dev Dependencies:**

- typescript - Type checking
- vite - Build tool
- @crxjs/vite-plugin - Chrome extension support
- tailwindcss - CSS framework
- @types/\* - Type definitions
