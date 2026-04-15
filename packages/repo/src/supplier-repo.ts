import type { Supplier } from '@arsv2/types';

export class SupplierRepo {
  private store = new Map<string, Supplier>();

  findById(id: string): Supplier | undefined {
    return this.store.get(id);
  }

  findAll(): Supplier[] {
    return Array.from(this.store.values());
  }

  findActive(): Supplier[] {
    return Array.from(this.store.values()).filter((s) => s.isActive);
  }

  save(supplier: Supplier): void {
    this.store.set(supplier.id, supplier);
  }

  saveBatch(suppliers: Supplier[]): void {
    suppliers.forEach((s) => this.save(s));
  }

  clear(): void {
    this.store.clear();
  }
}
