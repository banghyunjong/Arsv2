import type { Product } from '@arsv2/types';

/**
 * In-memory product repository.
 * Phase 1 (CSV mockup): data loaded from parsed CSV.
 * Phase 2: swap to database-backed implementation.
 */
export class ProductRepo {
  private store = new Map<string, Product>();

  findAll(): Product[] {
    return Array.from(this.store.values());
  }

  findById(id: string): Product | undefined {
    return this.store.get(id);
  }

  findBySku(sku: string): Product | undefined {
    return Array.from(this.store.values()).find((p) => p.sku === sku);
  }

  findByCategory(category: Product['category']): Product[] {
    return Array.from(this.store.values()).filter((p) => p.category === category);
  }

  save(product: Product): void {
    this.store.set(product.id, product);
  }

  saveBatch(products: Product[]): void {
    products.forEach((p) => this.save(p));
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }

  count(): number {
    return this.store.size;
  }
}
