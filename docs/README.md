# Documentation

Documentation for the Accessibility Audit Chrome Extension.

---

## Getting Started

| Doc                                            | Purpose                                   |
| ---------------------------------------------- | ----------------------------------------- |
| [GETTING_STARTED.md](./GETTING_STARTED.md)     | Setup, install, troubleshooting           |
| [LOAD_IN_CHROME.md](./LOAD_IN_CHROME.md)       | Quick reference: load extension in Chrome |
| [MANUAL_TEST_GUIDE.md](./MANUAL_TEST_GUIDE.md) | How to test the extension in the browser  |

## Project & Development

| Doc                                            | Purpose                                |
| ---------------------------------------------- | -------------------------------------- |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Codebase layout, file roles, data flow |
| [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | Dev workflow, tasks, debugging         |
| [TESTING.md](./TESTING.md)                     | Tests, coverage, CI/CD                 |

## Status & Roadmap

| Doc                                                    | Purpose                            |
| ------------------------------------------------------ | ---------------------------------- |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | What’s done and what’s in progress |
| [ROADMAP.md](./ROADMAP.md)                             | Version roadmap (v1.0, v1.1)       |

---

## Quick Reference

- **Stack:** Chrome MV3, React 19, TypeScript 5.3, Vite 7, axe-core 4.8.3, pnpm
- **Root:** [../README.md](../README.md) — project overview

### Commands

```bash
pnpm install
pnpm run build
pnpm run dev
pnpm test:run
pnpm type-check
```

---

When adding docs: add a `.md` file in `docs/`, add an entry above, and keep headings and examples consistent.
