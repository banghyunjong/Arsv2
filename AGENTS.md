# AGENTS.md — ARSV2 Navigation Guide

> This file is a table of contents for agents. Keep it under 100 lines.
> If the agent can't see it, it doesn't exist. All knowledge lives in the repo.

## Project

**ARSV2** — Fashion Auto-Reorder System v2.0
TypeScript monorepo (npm workspaces + turborepo).

## Architecture

Read [ARCHITECTURE.md](ARCHITECTURE.md) first. The dependency law is:

```
Types → Config → Repo → Service → Runtime → UI
```

**Never** import from a higher layer into a lower layer. The linter at `tools/linters/arch-boundary.ts` enforces this mechanically.

## Package Map

| Layer | Package | Purpose |
|-------|---------|---------|
| 0 | `@arsv2/types` | Pure type definitions, no runtime deps |
| 1 | `@arsv2/config` | App configuration, env loading |
| 2 | `@arsv2/repo` | Data access (CSV parser, in-memory repos, Snowflake) |
| 3 | `@arsv2/service` | Business logic (reorder engine, inventory analysis) |
| 4 | `@arsv2/runtime` | Express API server, routes, middleware |
| 5 | `@arsv2/ui` | React frontend (Vite) |

Cross-cutting concerns (repos, services, config) are wired through the **Providers** interface in `packages/runtime/src/providers.ts`.

## Commands

```bash
npm install          # install all workspace deps
npm run build        # build all packages (turbo)
npm run dev          # start dev servers
npm run test         # run all tests
npm run lint         # lint all packages
npm run lint:arch    # validate architecture boundaries
npm run typecheck    # typecheck all packages
```

## Documentation

All docs live in `docs/`. See [docs/PLANS.md](docs/PLANS.md) for current execution plans.

| File | What it covers |
|------|---------------|
| [docs/DESIGN.md](docs/DESIGN.md) | Design principles and patterns |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | UI tone & manner — SPAO reference, color/typography/component specs |
| [docs/FRONTEND.md](docs/FRONTEND.md) | UI conventions and component patterns |
| [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) | Domain knowledge — fashion reorder logic |
| [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) | Quality metrics and thresholds |
| [docs/RELIABILITY.md](docs/RELIABILITY.md) | Error handling, retry, observability |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, input validation, API security |
| [docs/design-docs/](docs/design-docs/) | Design decisions and principles |
| [docs/product-specs/](docs/product-specs/) | Feature specifications |
| [docs/exec-plans/](docs/exec-plans/) | Active and completed execution plans |

## Conventions

- **Structured logging**: Use `console.log(JSON.stringify({ level, msg, ... }))` — no bare console.log.
- **File size**: Max 300 lines per source file. Split if larger.
- **Naming**: `kebab-case` for files, `PascalCase` for classes/types, `camelCase` for functions/vars.
- **Tests**: Co-located as `*.test.ts` next to source files.
- **Errors**: All API errors return `ApiResponse` shape from `@arsv2/types`.

## Environment

Snowflake credentials are in `.env` (not committed). Required vars:
`SNOWFLAKE_ACCOUNT`, `SNOWFLAKE_USER`, `SNOWFLAKE_TOKEN`, `SNOWFLAKE_WAREHOUSE`, `SNOWFLAKE_DATABASE`, `SNOWFLAKE_SCHEMA`

Connection test: `npx ts-node packages/repo/src/test-snowflake.ts`

## When Stuck

1. Read the relevant `docs/` file for context.
2. Check `docs/exec-plans/active/` for current priorities.
3. Run `npm run lint:arch` to verify you haven't broken layer boundaries.
4. If a lint error fires, the error message contains the fix instruction — follow it.
