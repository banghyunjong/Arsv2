# Database Schema (Generated)

> This file is auto-generated. Do not edit manually.
> Phase 1: No database — using in-memory stores with CSV upload.
> Phase 2: This file will contain the actual database schema.

## Planned Schema (Phase 2)

```sql
-- Products
CREATE TABLE products (
  id          VARCHAR(36) PRIMARY KEY,
  sku         VARCHAR(50) UNIQUE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  brand       VARCHAR(100),
  category    VARCHAR(50) NOT NULL,
  size        VARCHAR(20),
  color       VARCHAR(50),
  unit_price  DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency    VARCHAR(3) NOT NULL DEFAULT 'KRW',
  status      VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inventory
CREATE TABLE inventory (
  product_id      VARCHAR(36) REFERENCES products(id),
  sku             VARCHAR(50) NOT NULL,
  current_stock   INTEGER NOT NULL DEFAULT 0,
  reserved_stock  INTEGER NOT NULL DEFAULT 0,
  available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  warehouse_id    VARCHAR(36) NOT NULL,
  last_counted_at TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, warehouse_id)
);

-- Reorder Rules
CREATE TABLE reorder_rules (
  id                VARCHAR(36) PRIMARY KEY,
  sku               VARCHAR(50) NOT NULL,
  reorder_point     INTEGER NOT NULL,
  reorder_quantity  INTEGER NOT NULL,
  max_stock         INTEGER NOT NULL,
  lead_time_days    INTEGER NOT NULL DEFAULT 7,
  is_active         BOOLEAN NOT NULL DEFAULT true
);

-- Reorder Requests
CREATE TABLE reorder_requests (
  id                   VARCHAR(36) PRIMARY KEY,
  sku                  VARCHAR(50) NOT NULL,
  quantity             INTEGER NOT NULL,
  supplier_id          VARCHAR(36),
  status               VARCHAR(20) NOT NULL DEFAULT 'pending',
  requested_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  expected_delivery_at TIMESTAMP,
  completed_at         TIMESTAMP
);

-- Suppliers
CREATE TABLE suppliers (
  id                     VARCHAR(36) PRIMARY KEY,
  name                   VARCHAR(200) NOT NULL,
  contact_email          VARCHAR(200),
  lead_time_days         INTEGER NOT NULL DEFAULT 7,
  minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
  rating                 DECIMAL(3,2) DEFAULT 0,
  is_active              BOOLEAN NOT NULL DEFAULT true
);
```
