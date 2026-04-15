# DESIGN — Design Principles

## Architecture Style

**Layered monorepo** with strict unidirectional dependency flow. Each layer is a separate npm workspace package.

See [design-docs/dependency-layers.md](design-docs/dependency-layers.md) for the full ADR.

## Patterns in Use

### Provider Pattern (Dependency Injection)

All repos and services are wired in `@arsv2/runtime/src/providers.ts`. Route handlers receive a `Providers` object — no hidden globals, no service locators.

**Why**: Explicit dependencies make testing trivial (swap real repos for test doubles) and prevent circular imports.

### Repository Pattern

Data access is abstracted behind repo classes (`ProductRepo`, `InventoryRepo`, etc.). Phase 1 uses in-memory Maps. Phase 2 swaps to DB-backed implementations with the same interface.

**Why**: The Service layer doesn't know or care where data comes from.

### Domain Events

Business operations return `DomainEvent[]` instead of performing side effects directly. This keeps the reorder engine pure and testable.

**Why**: Events can be logged, replayed, and used for observability without coupling business logic to infrastructure.

## Anti-Patterns to Avoid

- **Cross-layer imports**: Never import from a higher layer. The linter catches this.
- **Hidden singletons**: All state flows through Providers. No `global.db` or module-level instances.
- **Fat controllers**: Route handlers should delegate to services immediately. No business logic in routes.
- **Barrel file abuse**: Index files re-export, they don't contain logic.
