# Dependency Layers — Architecture Decision Record

## Context

In an agent-driven codebase, architectural boundaries can erode quickly. Agents replicate patterns they see — including bad ones. Without mechanical enforcement, circular dependencies and layer violations accumulate.

## Decision

Enforce a strict 6-layer dependency model:

```
Layer 0: Types    — Pure types, no runtime code
Layer 1: Config   — App configuration, depends on Types only
Layer 2: Repo     — Data access, depends on Types + Config
Layer 3: Service  — Business logic, depends on Types + Config + Repo
Layer 4: Runtime  — API server, depends on all lower layers
Layer 5: UI       — Frontend, depends on Types only (HTTP to Runtime)
```

Each layer is a separate npm workspace package (`@arsv2/*`).

## Enforcement

- `tools/linters/arch-boundary.ts` — Static analysis that scans import statements and validates they follow the dependency law
- `npm run lint:arch` — CI gate that blocks merges on violation
- Error messages include remediation instructions

## Alternatives Considered

1. **No enforcement, rely on code review** — Rejected. Agents don't attend to convention without mechanical feedback.
2. **Single package with folder conventions** — Rejected. npm workspaces give real module boundaries.
3. **Nx instead of turborepo** — Considered. Turborepo chosen for simplicity and smaller config surface.

## Consequences

- Every new module must be placed in the correct layer
- Cross-cutting concerns funnel through the Providers interface in Runtime
- Phase 2 database migration only touches Repo layer — Service and above are unaffected
