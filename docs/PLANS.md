# PLANS — Execution Plans Overview

## Current Phase: Phase 1 — CSV Mockup

The system operates with in-memory data stores populated via CSV upload. No database, no external API integrations yet.

### Phase 1 Goals

- [x] Monorepo scaffold with architecture layer enforcement
- [x] Type definitions for all domain entities
- [x] In-memory repositories with CSV parser
- [x] Business logic: reorder engine + inventory analyzer
- [x] Express API with upload, product, inventory, reorder routes
- [x] Basic React UI for CSV upload
- [ ] End-to-end test with sample CSV files
- [ ] Dashboard view (inventory summary, low stock alerts)
- [ ] Reorder history view

### Phase 2 — Database + External APIs

See `exec-plans/active/` for detailed plans when started.

- [ ] PostgreSQL integration (swap Repo layer implementations)
- [ ] Supplier API integration (external order placement)
- [ ] ERP system sync
- [ ] Scheduled reorder evaluation (cron job)
- [ ] Authentication and authorization

### Phase 3 — Intelligence

- [ ] Demand forecasting based on historical data
- [ ] Seasonal pattern auto-detection
- [ ] Supplier performance scoring and optimization
- [ ] Anomaly detection (unusual stock movements)

## Active Execution Plans

Check [exec-plans/active/](exec-plans/active/) for currently in-flight work.

## Completed Plans

Check [exec-plans/completed/](exec-plans/completed/) for archived plans.
