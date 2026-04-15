# ARCHITECTURE.md — ARSV2 System Architecture

## Overview

ARSV2 (Fashion Auto-Reorder System v2.0) is a web service that automates fashion inventory reordering. It monitors stock levels, applies reorder rules, and generates purchase orders to suppliers.

**Phase 1 (Current)**: CSV-based mockup — data loaded via file upload.
**Phase 2 (Planned)**: Database-backed with external supplier API integrations.

## System Diagram

```
┌──────────────────────────────────────────────────────────┐
│                        UI (Layer 5)                       │
│                   React + Vite (port 5173)                │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP /api/*
┌────────────────────────▼─────────────────────────────────┐
│                     Runtime (Layer 4)                      │
│              Express API Server (port 3000)                │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────────────┐  │
│  │ Products │ │Inventory │ │Reorder │ │  CSV Upload     │  │
│  │ Routes   │ │ Routes   │ │Routes  │ │  Routes         │  │
│  └────┬─────┘ └────┬─────┘ └───┬────┘ └──────┬─────────┘  │
│       └─────────────┴───────────┴──────────────┘           │
│                     Providers (DI)                          │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                    Service (Layer 3)                       │
│  ┌──────────────┐ ┌────────────────┐ ┌────────────────┐  │
│  │ReorderEngine │ │InventoryAnalyzer│ │CsvUploadService│  │
│  └──────┬───────┘ └───────┬────────┘ └───────┬────────┘  │
└─────────┴─────────────────┴──────────────────┴───────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                      Repo (Layer 2)                       │
│  ┌───────────┐ ┌──────────────┐ ┌───────────┐           │
│  │ProductRepo│ │InventoryRepo │ │ReorderRepo│ ...        │
│  └───────────┘ └──────────────┘ └───────────┘           │
│  ┌───────────┐ ┌──────────────┐                           │
│  │ CsvParser │ │SnowflakeConn │ (Phase 1→2 migration)    │
│  └───────────┘ └──────────────┘                           │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                     Config (Layer 1)                      │
│     Server, CSV, Reorder, External API, Snowflake config  │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                     Types (Layer 0)                       │
│    Product, Inventory, Reorder, Supplier, CSV, API types  │
└──────────────────────────────────────────────────────────┘
```

## Dependency Law

```
Layer 0: Types      — depends on nothing
Layer 1: Config     — depends on Types
Layer 2: Repo       — depends on Types, Config
Layer 3: Service    — depends on Types, Config, Repo
Layer 4: Runtime    — depends on Types, Config, Repo, Service
Layer 5: UI         — depends on Types only (communicates with Runtime via HTTP)
```

**Rule**: A package may only import from packages at a lower layer number. Importing from a higher layer is a build-breaking violation enforced by `tools/linters/arch-boundary.ts`.

## Cross-Cutting: Providers

The `Providers` interface in `@arsv2/runtime` is the single wiring point for all repos and services. This avoids hidden singletons and makes dependency flow explicit and testable.

```typescript
interface Providers {
  repos: { product, inventory, reorder, supplier };
  services: { reorderEngine, inventoryAnalyzer, csvUpload };
}
```

## Data Flow — CSV Upload

```
User uploads CSV → multer (memory) → CsvParser.parse()
  → validator per row → ProductRepo.saveBatch() / InventoryRepo.saveBatch()
  → CsvUploadResult returned to client
```

## Data Flow — Reorder Evaluation

```
POST /api/reorder/evaluate
  → ReorderEngine.evaluateAll()
    → For each active ReorderRule:
      → Check InventoryRepo for current stock
      → Classify stock level (critical/low/normal/overstock)
      → If low/critical AND no pending order → create ReorderRequest
  → Return generated DomainEvents
```

## Technology Choices

| Concern | Choice | Why |
|---------|--------|-----|
| Language | TypeScript | Type safety, agent-friendly, strong ecosystem |
| Monorepo | npm workspaces + turborepo | Layer enforcement, incremental builds |
| API | Express | Stable, well-documented, large training corpus |
| Frontend | React + Vite | Fast dev loop, minimal config |
| Data (Phase 1) | In-memory + CSV | Quick iteration without DB setup |
| Data (Phase 2) | Snowflake (EDW) | JWT PAT auth, `@arsv2/repo` snowflake module |

## Data Flow — Snowflake

```
loadConfig() → SnowflakeConfig from .env (dotenv)
  → createSnowflakeConnection(config) → snowflake.Connection
  → connection.connect() (JWT PAT auth)
  → connection.execute(sqlText) → rows
  → destroyConnection(connection)
```

- **Auth**: `PROGRAMMATIC_ACCESS_TOKEN` — JWT PAT stored in `.env`
- **Target**: `EDW.RSC` (Snowflake EDW, RSC schema)
- **Module**: `packages/repo/src/snowflake.ts`
- **Test**: `npx ts-node packages/repo/src/test-snowflake.ts`

## Key Directories

```
packages/types/      → @arsv2/types      (Layer 0)
packages/config/     → @arsv2/config     (Layer 1)
packages/repo/       → @arsv2/repo       (Layer 2)
packages/service/    → @arsv2/service    (Layer 3)
packages/runtime/    → @arsv2/runtime    (Layer 4)
packages/ui/         → @arsv2/ui         (Layer 5)
tools/linters/       → Custom architecture linters
docs/                → All documentation (agent-readable)
```
