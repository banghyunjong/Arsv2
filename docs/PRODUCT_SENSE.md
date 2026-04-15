# PRODUCT SENSE — Domain Knowledge

## What is Fashion Auto-Reorder?

Fashion retailers manage thousands of SKUs across sizes, colors, and seasonal collections. When stock runs low, a purchase order must be placed with suppliers before stockouts cause lost sales. ARSV2 automates this decision-making process.

## Key Domain Concepts

### SKU (Stock Keeping Unit)

A unique identifier for each product variant. Example: `TOP-BLK-M` = black top, size M. The SKU is the primary key for inventory and reorder operations.

### Reorder Point

The stock level at which a new order should be triggered. Set per SKU based on:
- Average daily sales velocity
- Supplier lead time (days from order to delivery)
- Safety stock buffer

### Lead Time

Days between placing an order and receiving goods. Varies by supplier and product type. Critical for calculating when to trigger reorders.

### Seasonal Adjustment

Fashion demand is highly seasonal. A winter coat may need 2x normal reorder quantity in October-November. Seasonal multipliers adjust reorder quantities accordingly.

### Stock Levels

| Level | Meaning | Action |
|-------|---------|--------|
| Critical | Below emergency threshold | Immediate reorder, alert |
| Low | Below reorder point | Generate reorder request |
| Normal | Healthy stock levels | No action |
| Overstock | Above maximum threshold | Flag for review, possible markdown |

## Business Rules

1. **No duplicate orders**: If a pending/approved/ordered request exists for a SKU, don't create another.
2. **Supplier selection**: Use the first supplier in the rule's supplier list (Phase 1). Phase 2 will add smart selection based on lead time and rating.
3. **Seasonal priority**: Seasonal multiplier overrides base reorder quantity when active.
4. **Critical alerts**: Critical stock items should be surfaced immediately in the UI dashboard.

## Data Sources (Phase 1)

All data enters via CSV upload:
- **Product catalog CSV**: SKU, name, brand, category, size, color, price
- **Inventory CSV**: SKU, current stock, reserved stock, warehouse

Phase 2 will add direct database connections and supplier API integrations.
