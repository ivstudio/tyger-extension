# Documentation Index

Complete documentation for the Accessibility Audit Chrome Extension.

---

## 🚀 Getting Started

**New to the project? Start here:**

1. **[QUICK_START.md](./QUICK_START.md)** - Fast setup and testing (5 minutes)
2. **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Detailed setup guide with troubleshooting
3. **[MANUAL_TEST_GUIDE.md](./MANUAL_TEST_GUIDE.md)** - How to test the extension in Chrome

---

## 📚 Understanding the Project

**Architecture and design:**

- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Codebase organization, file responsibilities, data flow
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What's been built, current status, tech stack

---

## 🛠️ Development

**For developers working on the code:**

- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development workflow, common tasks, debugging tips
- **[TODO.md](./TODO.md)** - Feature roadmap and next steps checklist

---

## 📊 Status & Progress

**Track implementation progress:**

- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - What's complete, what's in progress, what's planned
- **[BUILD_SUMMARY.md](./BUILD_SUMMARY.md)** - Build status, what was accomplished
- **[TEST_RESULTS.md](./TEST_RESULTS.md)** - Build test results and technical details

---

## 📖 Quick Reference

### Key Facts

- **Extension Type:** Chrome Manifest V3
- **Framework:** React 18 + TypeScript
- **Scanner:** axe-core 4.11.1
- **Build Tool:** Vite 5.4.21
- **Package Manager:** pnpm (not npm)
- **Current Status:** ✅ Working - Phases 1-3 complete

### Quick Commands

```bash
# Install dependencies
pnpm install

# Development mode (use production build instead)
pnpm run dev

# Production build (recommended)
pnpm run build

# Type check
pnpm run type-check
```

### Load in Chrome

1. Build: `pnpm run build`
2. Go to: `chrome://extensions/`
3. Enable Developer Mode
4. Click "Load unpacked"
5. Select: `/path/to/project/dist`

---

## 🎯 Document Guide by Use Case

### "I want to quickly test the extension"
→ [QUICK_START.md](./QUICK_START.md)

### "I'm getting errors during setup"
→ [GETTING_STARTED.md](./GETTING_STARTED.md) (see Troubleshooting section)

### "I want to understand how the code works"
→ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

### "I want to add a new feature"
→ [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

### "I want to see what's left to build"
→ [TODO.md](./TODO.md) or [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)

### "I want to know if the build succeeded"
→ [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) or [TEST_RESULTS.md](./TEST_RESULTS.md)

---

## 📁 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| [QUICK_START.md](./QUICK_START.md) | Fast testing guide | Everyone |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Detailed setup | New contributors |
| [MANUAL_TEST_GUIDE.md](./MANUAL_TEST_GUIDE.md) | Browser testing | QA/Testers |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Architecture overview | Developers |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Build overview | Everyone |
| [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | Dev workflow | Developers |
| [TODO.md](./TODO.md) | Roadmap & tasks | Contributors |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | Progress tracking | Project managers |
| [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) | Build results | Everyone |
| [TEST_RESULTS.md](./TEST_RESULTS.md) | Technical details | Developers |

---

## 🔗 Related Files

Main project documentation:
- **[../README.md](../README.md)** - Project overview (in root)
- **[../LOAD_IN_CHROME.txt](../LOAD_IN_CHROME.txt)** - Quick reference card

---

## 📝 Contributing to Docs

When adding new documentation:

1. Create `.md` file in this `docs/` directory
2. Add entry to this README index
3. Use clear, descriptive headings
4. Include code examples where relevant
5. Keep formatting consistent with existing docs

---

## ✅ Documentation Standards

All docs follow these guidelines:

- **Markdown format** - GitHub-flavored markdown
- **Clear structure** - Table of contents for long docs
- **Code blocks** - Use syntax highlighting
- **Examples** - Include practical examples
- **Updates** - Keep in sync with code changes

---

Last updated: January 31, 2026
