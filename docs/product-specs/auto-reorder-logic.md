# Auto-Reorder Logic

## Problem

Manual reorder decisions lead to stockouts (lost sales) or overstock (tied-up capital). ARSV2 automates this by evaluating reorder rules against current inventory levels.

## How It Works

### Stock Classification

For each SKU with an active reorder rule:

| Condition | Level |
|-----------|-------|
| `availableStock <= criticalStockThreshold` (default: 10) | **critical** |
| `availableStock <= reorderPoint` | **low** |
| `availableStock >= maxStock` | **overstock** |
| Otherwise | **normal** |

### Reorder Decision

When stock is **critical** or **low**:
1. Check if there's already a pending/approved/ordered request for this SKU
2. If no existing request → create a new `ReorderRequest`
3. Apply seasonal adjustment multiplier if configured

### Seasonal Adjustments

Each reorder rule can have an optional seasonal multiplier:
- Example: Winter coat with `reorderQuantity: 100` and `winter.multiplier: 1.5` → orders 150 units

## API Endpoint

### `POST /api/reorder/evaluate`

Triggers evaluation of all active reorder rules. Returns the list of domain events generated (stock warnings, new reorder requests).

## Acceptance Criteria

- [ ] All active reorder rules are evaluated in a single pass
- [ ] SKUs below reorder point generate STOCK_LOW events
- [ ] Duplicate orders are prevented (no new request if pending/approved/ordered exists)
- [ ] Seasonal multiplier is applied correctly (rounded up)
- [ ] Inactive rules are skipped
- [ ] SKUs with no inventory record are skipped (not errored)

## Future Enhancements

- Historical demand-based reorder quantity suggestions
- Supplier lead time optimization (prefer faster supplier when critical)
- Automatic approval for low-risk reorders
