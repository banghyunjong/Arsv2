import type { ReorderRequest, ReorderRule, StockLevel, DomainEvent } from '@arsv2/types';
import type { ReorderConfig } from '@arsv2/config';
import { InventoryRepo, ReorderRepo } from '@arsv2/repo';

export class ReorderEngine {
  constructor(
    private inventoryRepo: InventoryRepo,
    private reorderRepo: ReorderRepo,
    private config: ReorderConfig,
  ) {}

  /**
   * Scan all active reorder rules and generate requests for items below reorder point.
   */
  evaluateAll(): DomainEvent[] {
    const events: DomainEvent[] = [];
    const rules = this.reorderRepo.findActiveRules();

    for (const rule of rules) {
      const inventory = this.inventoryRepo.findBySku(rule.sku);
      if (!inventory) continue;

      const stockLevel = this.classifyStock(inventory.availableStock, rule);

      if (stockLevel.level === 'critical' || stockLevel.level === 'low') {
        events.push({ type: 'STOCK_LOW', payload: stockLevel });

        const hasPendingOrder = this.reorderRepo
          .findRequestsBySku(rule.sku)
          .some((r) => r.status === 'pending' || r.status === 'approved' || r.status === 'ordered');

        if (!hasPendingOrder) {
          const request = this.createReorderRequest(rule);
          this.reorderRepo.saveRequest(request);
          events.push({ type: 'REORDER_CREATED', payload: request });
        }
      }
    }

    return events;
  }

  private classifyStock(
    availableStock: number,
    rule: ReorderRule,
  ): StockLevel {
    let level: StockLevel['level'];
    if (availableStock <= this.config.criticalStockThreshold) {
      level = 'critical';
    } else if (availableStock <= rule.reorderPoint) {
      level = 'low';
    } else if (availableStock >= rule.maxStock) {
      level = 'overstock';
    } else {
      level = 'normal';
    }

    return {
      sku: rule.sku,
      level,
      currentStock: availableStock,
      reorderPoint: rule.reorderPoint,
    };
  }

  private createReorderRequest(rule: ReorderRule): ReorderRequest {
    const quantity = rule.seasonalAdjustment
      ? Math.ceil(rule.reorderQuantity * rule.seasonalAdjustment.multiplier)
      : rule.reorderQuantity;

    return {
      id: `RO-${Date.now()}-${rule.sku}`,
      sku: rule.sku,
      quantity,
      supplierId: rule.supplierIds[0] || '',
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
  }
}
