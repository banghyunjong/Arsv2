import type { AppConfig } from '@arsv2/config';
import { CsvParser, ProductRepo, InventoryRepo, ReorderRepo, SupplierRepo } from '@arsv2/repo';
import { ReorderEngine, InventoryAnalyzer, CsvUploadService } from '@arsv2/service';

/**
 * Providers: single cross-cutting interface that wires repos and services.
 * All dependencies flow through here — no hidden singletons.
 */
export interface Providers {
  repos: {
    product: ProductRepo;
    inventory: InventoryRepo;
    reorder: ReorderRepo;
    supplier: SupplierRepo;
  };
  services: {
    reorderEngine: ReorderEngine;
    inventoryAnalyzer: InventoryAnalyzer;
    csvUpload: CsvUploadService;
  };
}

export function createProviders(config: AppConfig): Providers {
  const csvParser = new CsvParser();
  const productRepo = new ProductRepo();
  const inventoryRepo = new InventoryRepo();
  const reorderRepo = new ReorderRepo();
  const supplierRepo = new SupplierRepo();

  const reorderEngine = new ReorderEngine(inventoryRepo, reorderRepo, config.reorder);
  const inventoryAnalyzer = new InventoryAnalyzer(inventoryRepo, config.reorder);
  const csvUpload = new CsvUploadService(csvParser, productRepo, inventoryRepo);

  return {
    repos: { product: productRepo, inventory: inventoryRepo, reorder: reorderRepo, supplier: supplierRepo },
    services: { reorderEngine, inventoryAnalyzer, csvUpload },
  };
}
