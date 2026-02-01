# Accessibility Audit Chrome Extension

[![CI](https://github.com/YOUR_USERNAME/accessibility-extension/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/accessibility-extension/actions)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/accessibility-extension/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/accessibility-extension)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive accessibility auditing tool powered by axe-core for Chrome. This extension helps developers, QA engineers, and designers identify and fix accessibility issues on web pages.

**📚 [Complete Documentation →](./docs/)**

## Features

- **Automated Scanning**: Powered by axe-core for WCAG 2.0/2.1/2.2 compliance checking
- **Role-Based Recommendations**: Tailored guidance for developers, QA, and designers
- **Visual Highlighting**: On-page highlights of accessibility violations
- **Manual Checklists**: Guided validation for issues that can't be automated
- **Export Reports**: JSON export for integration with issue tracking systems
- **Diff Detection**: Compare scans to track new and resolved issues

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm (not npm)
- Chrome browser 114+

### Installation & Setup

```bash
# Install dependencies
pnpm install

# Production build (recommended)
pnpm run build
```

### Loading in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` directory from this project
5. Navigate to any website
6. Click extension icon → Click "Run Scan"

**📖 Detailed setup guide:** [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)

## Project Structure

```
accessibility-extension/
├── public/
│   ├── manifest.json       # Chrome extension manifest
│   └── icons/              # Extension icons
├── src/
│   ├── background/         # Service worker
│   │   └── index.ts
│   ├── contentScripts/            # Content script (runs on web pages)
│   │   └── index.ts
│   ├── sidepanel/          # React UI
│   │   ├── components/
│   │   ├── context/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── services/                # Shared utilities
│   │   ├── scanner.ts      # axe-core integration
│   │   ├── storage.ts      # Chrome storage API
│   │   └── messaging.ts    # Type-safe messaging
│   └── types/              # TypeScript types
│       ├── issue.ts
│       ├── checklist.ts
│       └── messages.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Tech Stack

- **Runtime**: Chrome Extension Manifest V3
- **Framework**: React 18 with TypeScript
- **Build**: Vite with @crxjs/vite-plugin
- **UI**: Tailwind CSS + shadcn/ui (Radix)
- **Scanner**: axe-core 4.8+
- **Icons**: Lucide React
- **Validation**: Zod for message schemas

## Usage

1. Click the extension icon to open the side panel
2. Click "Run Scan" to analyze the current page
3. Review issues grouped by severity (Critical, Serious, Moderate, Minor)
4. Select an issue to view:
    - Detailed description
    - Element location and HTML
    - Role-specific recommendations
    - WCAG criteria
5. Update issue status (Fixed, Ignored, Needs Design)
6. Export results as JSON

## Roadmap

### v1.0 (Current)

- [x] Core scanning with axe-core
- [x] Side panel UI with issue list
- [x] Role-based recommendations
- [x] JSON export
- [ ] Visual highlights on page
- [ ] Element picker
- [ ] Manual checklists
- [ ] Scan diff detection

### v1.1 (Future)

- [ ] HTML/Markdown export formats
- [ ] Custom rule configuration
- [ ] Firefox support
- [ ] Automated re-scanning on DOM changes
- [ ] Analytics opt-in

## Development

### Testing

This project uses **Vitest** with comprehensive test coverage for services, reducers, and components.

```bash
# Run all tests
pnpm test:run

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Open test UI
pnpm test:ui
```

**Coverage Requirements:**

- Overall: 80% lines/statements, 75% functions/branches
- Critical files (scanner, storage, reducer): 90%+ coverage
- See [TESTING.md](./TESTING.md) for detailed testing guide

**Current Status:**

- ✅ 70 tests passing
- ✅ Scanner service (13 tests)
- ✅ Storage service (29 tests)
- ✅ Scan reducer (28 tests - all 11 action types)

### Code Quality

```bash
# Lint TypeScript files
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check code formatting
pnpm format:check

# Format code
pnpm format

# Type check
pnpm type-check
```

### Pre-commit Hooks

This project uses **Husky** and **lint-staged** to enforce code quality:

- ESLint runs on TypeScript files
- Prettier formats all staged files
- Conventional commit messages enforced (`feat:`, `fix:`, `docs:`, etc.)

### CI/CD

GitHub Actions runs on every push and PR:

1. **Lint** - ESLint validation
2. **Format Check** - Prettier validation
3. **Type Check** - TypeScript compilation
4. **Test & Coverage** - Full test suite with Codecov upload
5. **Build** - Production build verification
6. **Package** - Creates Chrome Web Store .zip (main branch only)

All checks must pass before merging.

## Contributing

This is currently a personal project, but contributions are welcome. Please open an issue first to discuss proposed changes.

## License

TBD

## Resources

- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
