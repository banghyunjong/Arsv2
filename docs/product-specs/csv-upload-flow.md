# CSV Upload Flow

## Problem

Users need to bulk-import product catalogs and inventory data into ARSV2 without manual entry. In Phase 1, CSV upload is the primary data ingestion method.

## User Flow

1. User navigates to the upload page
2. Selects a CSV file (products or inventory)
3. System parses the file, validates each row
4. Valid rows are stored; errors are reported with row numbers and field details
5. User sees a summary: total rows, success count, error count, error details

## API Endpoints

### `POST /api/upload/products`

**Input**: multipart/form-data with `file` field (CSV)

**CSV Columns**: `id, sku, name, brand, category, size, color, unitPrice, currency`

**Response**: `ApiResponse<CsvUploadResult>`

### `POST /api/upload/inventory`

**Input**: multipart/form-data with `file` field (CSV)

**CSV Columns**: `productId, sku, currentStock, reservedStock, warehouseId, lastCountedAt`

**Response**: `ApiResponse<CsvUploadResult>`

## Acceptance Criteria

- [ ] CSV files up to 10MB are accepted
- [ ] Non-CSV files are rejected with a clear error message
- [ ] Missing required fields (sku, name for products; sku, currentStock for inventory) produce row-level errors
- [ ] Invalid numeric values produce row-level errors with the original value shown
- [ ] Successfully parsed rows are stored and immediately queryable via GET endpoints
- [ ] Upload result includes fileName, totalRows, successRows, errorRows, and error details

## Edge Cases

- Empty CSV (headers only): returns totalRows=0, no errors
- Duplicate SKUs: later rows overwrite earlier ones (last-write-wins)
- Extra columns in CSV: ignored silently
- Missing optional columns: filled with defaults
