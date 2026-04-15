import type { Product, InventoryRecord, CsvUploadResult, CsvRowError } from '@arsv2/types';
import { CsvParser, ProductRepo, InventoryRepo } from '@arsv2/repo';

export class CsvUploadService {
  constructor(
    private csvParser: CsvParser,
    private productRepo: ProductRepo,
    private inventoryRepo: InventoryRepo,
  ) {}

  uploadProducts(fileName: string, content: string): CsvUploadResult {
    const result = this.csvParser.parse<Product>(content, (row, index) => {
      if (!row.sku || !row.name) {
        return { row: index, field: 'sku/name', message: 'SKU and name are required' };
      }
      return {
        id: row.id || `P-${Date.now()}-${index}`,
        sku: row.sku,
        name: row.name,
        brand: row.brand || '',
        category: (row.category as Product['category']) || 'tops',
        size: row.size || '',
        color: row.color || '',
        unitPrice: parseFloat(row.unitPrice) || 0,
        currency: (row.currency as Product['currency']) || 'KRW',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    this.productRepo.saveBatch(result.records);
    return { ...result, fileName };
  }

  uploadInventory(fileName: string, content: string): CsvUploadResult {
    const result = this.csvParser.parse<InventoryRecord>(content, (row, index) => {
      if (!row.sku) {
        return { row: index, field: 'sku', message: 'SKU is required' };
      }
      const currentStock = parseInt(row.currentStock, 10);
      if (isNaN(currentStock)) {
        return { row: index, field: 'currentStock', message: 'Invalid stock number', value: row.currentStock };
      }
      const reserved = parseInt(row.reservedStock, 10) || 0;
      return {
        productId: row.productId || `P-${row.sku}`,
        sku: row.sku,
        currentStock,
        reservedStock: reserved,
        availableStock: currentStock - reserved,
        warehouseId: row.warehouseId || 'WH-DEFAULT',
        lastCountedAt: row.lastCountedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    this.inventoryRepo.saveBatch(result.records);
    return { ...result, fileName };
  }
}
