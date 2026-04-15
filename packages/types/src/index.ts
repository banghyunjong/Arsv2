/**
 * @arsv2/types — Layer 0
 * Pure type definitions. No runtime dependencies.
 * All other packages depend on this layer.
 */

// ─── Product ────────────────────────────────────────────────
export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  size: string;
  color: string;
  unitPrice: number;
  currency: Currency;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | 'tops'
  | 'bottoms'
  | 'outerwear'
  | 'dresses'
  | 'accessories'
  | 'footwear';

export type ProductStatus = 'active' | 'discontinued' | 'seasonal';

export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY';

// ─── Inventory ──────────────────────────────────────────────
export interface InventoryRecord {
  productId: string;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  warehouseId: string;
  lastCountedAt: string;
  updatedAt: string;
}

export interface StockLevel {
  sku: string;
  level: 'critical' | 'low' | 'normal' | 'overstock';
  currentStock: number;
  reorderPoint: number;
}

// ─── Reorder ────────────────────────────────────────────────
export interface ReorderRule {
  id: string;
  sku: string;
  reorderPoint: number;
  reorderQuantity: number;
  maxStock: number;
  leadTimeDays: number;
  supplierIds: string[];
  isActive: boolean;
  seasonalAdjustment?: SeasonalAdjustment;
}

export interface SeasonalAdjustment {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  multiplier: number;
}

export interface ReorderRequest {
  id: string;
  sku: string;
  quantity: number;
  supplierId: string;
  status: ReorderStatus;
  requestedAt: string;
  expectedDeliveryAt?: string;
  completedAt?: string;
}

export type ReorderStatus =
  | 'pending'
  | 'approved'
  | 'ordered'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// ─── Supplier ───────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  rating: number;
  isActive: boolean;
}

// ─── CSV Upload ─────────────────────────────────────────────
export interface CsvUploadResult {
  fileName: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: CsvRowError[];
  uploadedAt: string;
}

export interface CsvRowError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

// ─── API ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  timestamp: string;
}

// ─── Events ─────────────────────────────────────────────────
export type DomainEvent =
  | { type: 'STOCK_LOW'; payload: StockLevel }
  | { type: 'REORDER_CREATED'; payload: ReorderRequest }
  | { type: 'REORDER_STATUS_CHANGED'; payload: { id: string; from: ReorderStatus; to: ReorderStatus } }
  | { type: 'CSV_UPLOADED'; payload: CsvUploadResult }
  | { type: 'INVENTORY_UPDATED'; payload: InventoryRecord };
