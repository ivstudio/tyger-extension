# Accessibility Audit Chrome Extension

[![CI](https://github.com/ivstudio/tyger-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/ivstudio/tyger-extension/actions)
[![codecov](https://codecov.io/gh/ivstudio/tyger-extension/branch/main/graph/badge.svg)](https://codecov.io/gh/ivstudio/tyger-extension)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive accessibility auditing tool powered by axe-core for Chrome. Helps developers, QA, and designers find and fix accessibility issues on web pages.

**[📚 Documentation](./docs/)**

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Development](#development)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Resources](#resources)

---

## Features

- **Automated Scanning** — axe-core for WCAG 2.0/2.1/2.2 compliance
- **Role-Based Recommendations** — Guidance for developers, QA, and designers
- **Visual Highlighting** — On-page highlights of violations
- **Manual Checklists** — Validation for issues that can’t be automated
- **Export Reports** — JSON export for issue tracking
- **Diff Detection** — Compare scans for new and resolved issues

## Tech Stack

![Chrome Extension](https://img.shields.io/badge/Chrome_Extension_MV3-4285F4?style=flat&logo=googlechrome&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat&logo=tailwindcss&logoColor=white)
![Radix](https://img.shields.io/badge/shadcn_ui-Radix-161618?style=flat&logo=radixui&logoColor=white)
![axe-core](https://img.shields.io/badge/axe--core-4.8.3-F34F64?style=flat&logo=deque&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-React-B8B8B8?style=flat&logo=lucide&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4-3E4A59?style=flat&logo=zod&logoColor=white)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (not npm)
- Chrome 114+

### Install

```bash
pnpm install
pnpm run build
```

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist` folder
4. Open any page → extension icon → **Run Scan**

## Usage

1. Open the side panel from the extension icon
2. Click **Run Scan** to analyze the page
3. Review issues by severity (Critical, Serious, Moderate, Minor)
4. Select an issue for description, element location, recommendations, and WCAG criteria
5. Set status (Fixed, Ignored, Needs Design) or export as JSON

## Development

### Testing

```bash
pnpm test:run        # run all tests
pnpm test:watch     # watch mode
pnpm test:coverage   # coverage report
pnpm test:ui        # test UI
```

### Lint & Format

```bash
pnpm lint           # ESLint
pnpm lint:fix       # auto-fix
pnpm format:check   # check formatting
pnpm format         # format files
pnpm type-check     # TypeScript
```

### Pre-commit

Husky + lint-staged: ESLint and Prettier on staged files; commitlint for conventional commits (`feat:`, `fix:`, etc.).

## Documentation

| Topic   | Doc                                                               |
| ------- | ----------------------------------------------------------------- |
| Setup   | [GETTING_STARTED.md](./docs/GETTING_STARTED.md)                   |
| Testing | [TESTING.md](./docs/TESTING.md)                                   |
| Roadmap | [ROADMAP.md](./docs/ROADMAP.md)                                   |
| CI/CD   | [TESTING.md#cicd-integration](./docs/TESTING.md#cicd-integration) |

Full index: **[docs/README.md](./docs/README.md)**

## Contributing

Contributions are welcome. Open an issue first to discuss changes.

## License

TBD

## Resources

- [axe-core](https://github.com/dequelabs/axe-core)
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/)
