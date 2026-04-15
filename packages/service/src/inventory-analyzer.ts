import type { InventoryRecord, StockLevel } from '@arsv2/types';
import type { ReorderConfig } from '@arsv2/config';
import { InventoryRepo } from '@arsv2/repo';

export interface InventorySummary {
  totalProducts: number;
  criticalCount: number;
  lowCount: number;
  normalCount: number;
  overstockCount: number;
  totalStockValue: number;
}

export class InventoryAnalyzer {
  constructor(
    private inventoryRepo: InventoryRepo,
    private config: ReorderConfig,
  ) {}

  getSummary(): InventorySummary {
    const records = this.inventoryRepo.findAll();
    const summary: InventorySummary = {
      totalProducts: records.length,
      criticalCount: 0,
      lowCount: 0,
      normalCount: 0,
      overstockCount: 0,
      totalStockValue: 0,
    };

    for (const record of records) {
      const level = this.classifyLevel(record);
      switch (level) {
        case 'critical':
          summary.criticalCount++;
          break;
        case 'low':
          summary.lowCount++;
          break;
        case 'normal':
          summary.normalCount++;
          break;
        case 'overstock':
          summary.overstockCount++;
          break;
      }
    }

    return summary;
  }

  getLowStockItems(): StockLevel[] {
    return this.inventoryRepo.findLowStock(this.config.lowStockThreshold);
  }

  private classifyLevel(record: InventoryRecord): StockLevel['level'] {
    if (record.availableStock <= this.config.criticalStockThreshold) return 'critical';
    if (record.availableStock <= this.config.lowStockThreshold) return 'low';
    return 'normal';
  }
}
