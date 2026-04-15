# QUALITY SCORE — Quality Metrics and Thresholds

## Taste Invariants

These are non-negotiable quality standards enforced by linters and CI.

### Code Structure

| Metric | Threshold | Enforced By |
|--------|-----------|-------------|
| Max file size | 300 lines | `tools/linters/arch-boundary.ts` |
| Architecture layer violations | 0 | `tools/linters/arch-boundary.ts` |
| TypeScript strict mode | Enabled | `tsconfig.base.json` |
| No `any` type usage | 0 occurrences | ESLint |

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `reorder-engine.ts` |
| Classes/Interfaces | PascalCase | `ReorderEngine` |
| Functions/Variables | camelCase | `findBySku` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Type aliases | PascalCase | `ReorderStatus` |

### API Response Shape

All API endpoints must return the `ApiResponse<T>` envelope:
```typescript
{ success: boolean; data?: T; error?: ApiError; meta?: ApiMeta; }
```

### Logging

- All log output must be structured JSON
- Required fields: `level`, `msg`, `timestamp`
- No bare `console.log('some string')` — always structured

## Quality Gates (CI)

1. `npm run typecheck` — zero type errors
2. `npm run lint` — zero lint errors
3. `npm run lint:arch` — zero architecture violations
4. `npm run test` — all tests pass
5. `npm run format:check` — all files formatted

## Monitoring (Phase 2)

- API response time: p95 < 200ms
- CSV upload time: < 5s for 10MB file
- Reorder evaluation: < 1s for 10,000 rules
