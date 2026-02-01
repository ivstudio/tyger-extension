# Claude Context - Accessibility Extension

Quick context for AI assistants working on this Chrome extension.

## What This Is

Chrome extension for WCAG accessibility auditing using axe-core. React 19 side panel, TypeScript, Tailwind, Manifest V3.

## Critical Context

### 1. State Management Pattern

Uses Redux-like reducer with **11 action types**. Located in `src/app/context/`.

**IMPORTANT**: `ScanState` has 9 required properties:

```typescript
{
    (currentScan,
        previousScan,
        selectedIssue,
        filters,
        isScanning,
        error,
        hasScannedOnce, // ← Recently added - MUST include in tests
        currentChecklist,
        viewMode);
}
```

**When writing tests**: Always use `...initialState` to avoid missing properties.

### 2. Component Structure

- **UI Components**: `src/app/components/ui/` - shadcn/ui (Radix + Tailwind)
- **Pattern**: Each component in own directory with `index.ts` re-export
- **Don't**: Create new UI primitives - reuse existing from `ui/`

### 3. Chrome Extension Architecture

```
Worker (background) ←→ Side Panel (React) ←→ Content Script (injected)
         ↓                     ↓                      ↓
              Shared Services (scanner, storage, messaging)
```

Type-safe messaging via `src/services/messaging.ts` using Zod schemas.

### 4. Storage Pattern

Chrome storage with auto-pruning (max 10 scans/checklists per URL).
Keys: `scan_results`, `manual_checklists`, `settings`.

## Project-Specific Rules

### Code Conventions

1. **NO** Co-Authored-By in commits (configured in `.claude/`)
2. **Conventional commits**: `feat:`, `fix:`, `test:`, `docs:`, etc.
3. **100 char max** per line in commit message body (commitlint enforces)
4. **TypeScript**: Prefer `type` over `interface` for simple types
5. **Imports**: Use `@/` alias (maps to `src/`)

### What NOT to Do

- ❌ Over-engineer (keep it simple)
- ❌ Add features not requested
- ❌ Create documentation files unless asked
- ❌ Add comments unless truly needed
- ❌ Commit without user asking
- ❌ Use `global` (use `globalThis` instead)

### Testing

- **70 tests** across scanner, storage, reducer (see `TESTING.md` for details)
- **Coverage**: 80% overall, 90%+ for critical files
- **Run**: `pnpm test:run` or `pnpm test:coverage`
- Pre-commit hooks auto-run ESLint + Prettier

### Common Issues

**"Property missing in ScanState"**
→ Add `hasScannedOnce` or use `...initialState`

**"Formatting check fails"**
→ Run `pnpm format` (not `pnpm format:check`)

**"Commit rejected by commitlint"**
→ Break long lines, use conventional format

**"Unused parameter error"**
→ Prefix with underscore: `_unusedParam`

## File Organization

**Critical files** (must maintain 90%+ test coverage):

- `src/services/scanner.ts` - axe-core integration
- `src/services/storage.ts` - Chrome storage wrapper
- `src/app/context/scanReducer.ts` - State reducer

**Documentation**:

- `README.md` - Project overview, setup, commands
- `TESTING.md` - Comprehensive testing guide
- `docs/` - Additional documentation

## Commands

```bash
pnpm dev              # Development
pnpm build            # Production build
pnpm test:run         # Run tests
pnpm test:coverage    # With coverage
pnpm lint             # ESLint
pnpm format           # Format all files
pnpm type-check       # TypeScript check
```

## Recent Changes

- **Feb 2026**: Testing infrastructure (Vitest, ESLint 9, CI/CD, Husky)
- **Jan 2026**: Manual checklists feature (Phase 6)
- Added `hasScannedOnce` to ScanState (breaks tests if missing)

---

**For detailed info**: See README.md (setup), TESTING.md (testing), or read the code directly.
