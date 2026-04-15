import type { InventoryRecord, StockLevel } from '@arsv2/types';

export class InventoryRepo {
  private store = new Map<string, InventoryRecord>();

  findByProductId(productId: string): InventoryRecord | undefined {
    return Array.from(this.store.values()).find((r) => r.productId === productId);
  }

  findBySku(sku: string): InventoryRecord | undefined {
    return Array.from(this.store.values()).find((r) => r.sku === sku);
  }

  findAll(): InventoryRecord[] {
    return Array.from(this.store.values());
  }

  findLowStock(threshold: number): StockLevel[] {
    return Array.from(this.store.values())
      .filter((r) => r.availableStock <= threshold)
      .map((r) => ({
        sku: r.sku,
        level: r.availableStock <= threshold / 3 ? 'critical' as const : 'low' as const,
        currentStock: r.currentStock,
        reorderPoint: threshold,
      }));
  }

  save(record: InventoryRecord): void {
    this.store.set(record.productId, record);
  }

  saveBatch(records: InventoryRecord[]): void {
    records.forEach((r) => this.save(r));
  }

  clear(): void {
    this.store.clear();
  }
}
