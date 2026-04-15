import type { ReorderRule, ReorderRequest } from '@arsv2/types';

export class ReorderRepo {
  private rules = new Map<string, ReorderRule>();
  private requests = new Map<string, ReorderRequest>();

  // ─── Rules ──────────────────────────────────────────────
  findRuleBySku(sku: string): ReorderRule | undefined {
    return Array.from(this.rules.values()).find((r) => r.sku === sku);
  }

  findActiveRules(): ReorderRule[] {
    return Array.from(this.rules.values()).filter((r) => r.isActive);
  }

  saveRule(rule: ReorderRule): void {
    this.rules.set(rule.id, rule);
  }

  saveRuleBatch(rules: ReorderRule[]): void {
    rules.forEach((r) => this.saveRule(r));
  }

  // ─── Requests ─────────────────────────────────────────────
  findRequestById(id: string): ReorderRequest | undefined {
    return this.requests.get(id);
  }

  findRequestsBySku(sku: string): ReorderRequest[] {
    return Array.from(this.requests.values()).filter((r) => r.sku === sku);
  }

  findPendingRequests(): ReorderRequest[] {
    return Array.from(this.requests.values()).filter(
      (r) => r.status === 'pending' || r.status === 'approved',
    );
  }

  saveRequest(request: ReorderRequest): void {
    this.requests.set(request.id, request);
  }

  clearRules(): void {
    this.rules.clear();
  }

  clearRequests(): void {
    this.requests.clear();
  }
}
