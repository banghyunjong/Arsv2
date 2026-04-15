# Tech Debt Tracker

> Entropy is a tax, not a crisis. Track it here, pay it daily.

## Active Debt

| ID | Area | Description | Priority | Added |
|----|------|-------------|----------|-------|
| TD-001 | Repo | In-memory stores have no persistence — data lost on restart | Medium | 2026-04-14 |
| TD-002 | Runtime | No request validation middleware (relies on TypeScript types) | Medium | 2026-04-14 |
| TD-003 | Service | CSV parser is naive (no quoted field support, no streaming) | Low | 2026-04-14 |
| TD-004 | UI | Minimal UI — no routing, no state management | Low | 2026-04-14 |

## Resolved Debt

| ID | Area | Description | Resolved | Resolution |
|----|------|-------------|----------|------------|
| — | — | — | — | — |

## Process

1. When you discover tech debt, add a row to **Active Debt** with today's date.
2. When working on a feature nearby, check if any active debt can be resolved cheaply.
3. Move resolved items to the **Resolved** table with a brief note on what was done.
