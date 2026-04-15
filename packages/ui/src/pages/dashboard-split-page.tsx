import { useState, useEffect, useMemo, useCallback } from 'react';
import { type ReorderConfirmItem, type DetailGridItem } from '../data/mock-dashboard';
import { fetchArsDetail } from '../data/ars-api';
import { ReorderSummaryCards } from '../components/reorder-summary-cards';
import { ReorderQuantityGrid } from '../components/reorder-quantity-grid';
import { ReorderDetailTable } from '../components/reorder-detail-table';

const DEFAULT_FACTORY = '미지정';
const MOCK_SOURCING = ['이태호', '장미영', '김상우', '박지은', '오현수'];
const MOCK_UNIT_PRICE = [12500, 15000, 18000, 22000, 9800, 14500, 16000, 20000];

function pickMock<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function buildReorderItems(ids: Set<string>, allItems: DetailGridItem[]): ReorderConfirmItem[] {
  const result: ReorderConfirmItem[] = [];
  const colorGroups = new Map<string, string[]>();

  for (const rid of ids) {
    const sepIdx = rid.indexOf('::');
    if (sepIdx === -1) {
      const item = allItems.find((i) => i.id === rid);
      if (item) {
        const unitPrice = pickMock(MOCK_UNIT_PRICE, item.styleCode.length + item.year);
        const colors = item.colorBreakdown.map((c) => ({
          colorName: c.colorName,
          colorCode: c.colorCode,
          quantity: c.reorderQuantity,
          orderAmount: c.reorderQuantity * unitPrice,
        }));
        const totalQty = colors.reduce((s, c) => s + c.quantity, 0);
        const seed = item.id.charCodeAt(item.id.length - 1);
        result.push({
          id: item.id,
          styleCode: item.styleCode,
          quantity: totalQty,
          orderAmount: totalQty * unitPrice,
          factory: item.colorBreakdown[0]?.supplierName ?? DEFAULT_FACTORY,
          planner: item.planner,
          sourcing: pickMock(MOCK_SOURCING, seed + 3),
          deliveryDate: `2026-${String(5 + (seed % 4)).padStart(2, '0')}-${String(10 + (seed % 20)).padStart(2, '0')}`,
          colors,
        });
      }
    } else {
      const parentId = rid.slice(0, sepIdx);
      const colorName = rid.slice(sepIdx + 2);
      if (!colorGroups.has(parentId)) colorGroups.set(parentId, []);
      colorGroups.get(parentId)!.push(colorName);
    }
  }

  for (const [parentId, colorNames] of colorGroups) {
    const parent = allItems.find((i) => i.id === parentId);
    if (!parent) continue;
    const selected = parent.colorBreakdown.filter((c) => colorNames.includes(c.colorName));
    if (selected.length === 0) continue;

    const unitPrice = pickMock(MOCK_UNIT_PRICE, parent.styleCode.length + parent.year);
    const colors = selected.map((c) => ({
      colorName: c.colorName,
      colorCode: c.colorCode,
      quantity: c.reorderQuantity,
      orderAmount: c.reorderQuantity * unitPrice,
    }));
    const totalQty = colors.reduce((s, c) => s + c.quantity, 0);
    const seed = parent.id.charCodeAt(parent.id.length - 1);

    result.push({
      id: parentId,
      styleCode: parent.styleCode,
      quantity: totalQty,
      orderAmount: totalQty * unitPrice,
      factory: selected[0]?.supplierName ?? DEFAULT_FACTORY,
      planner: parent.planner,
      sourcing: pickMock(MOCK_SOURCING, seed + 3),
      deliveryDate: `2026-${String(5 + (seed % 4)).padStart(2, '0')}-${String(10 + (seed % 20)).padStart(2, '0')}`,
      colors,
    });
  }

  return result;
}

export function DashboardSplitPage() {
  const [yearFilter, setYearFilter] = useState('2026');
  const [detailItems, setDetailItems] = useState<DetailGridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reorderIds, setReorderIds] = useState<Set<string>>(new Set());
  const [plannerFilter, setPlannerFilter] = useState('');

  const handleFetch = useCallback(async (year: number) => {
    setLoading(true);
    setFetchError(null);
    try {
      const items = await fetchArsDetail(year);
      setDetailItems(items);
      setReorderIds(new Set(
        items.filter((item) => item.achievementRate >= 200 && item.costRate < 35 && item.reorderQuantity > 0).map((item) => item.id),
      ));
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetch(2026);
  }, [handleFetch]);

  const planners = useMemo(() => [...new Set(detailItems.map((i) => i.planner))].filter(Boolean).sort(), [detailItems]);

  const displayItems = useMemo(
    () => plannerFilter ? detailItems.filter((i) => i.planner === plannerFilter) : detailItems,
    [detailItems, plannerFilter],
  );

  const reorderItems = useMemo(() => buildReorderItems(reorderIds, displayItems), [reorderIds, displayItems]);

  const [highlightAddedId, setHighlightAddedId] = useState<string | null>(null);
  const [highlightRemovedId, setHighlightRemovedId] = useState<string | null>(null);

  const flashAdded = useCallback((id: string) => {
    const parentId = id.includes('::') ? id.slice(0, id.indexOf('::')) : id;
    setHighlightAddedId(parentId);
    setHighlightRemovedId(null);
  }, []);

  const flashRemoved = useCallback((id: string) => {
    setHighlightRemovedId(id);
    setHighlightAddedId(null);
  }, []);

  const handleToggleReorder = useCallback((id: string) => {
    setReorderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        flashAdded(id);
      }
      return next;
    });
  }, [flashAdded]);

  const handleRemoveReorder = useCallback((id: string) => {
    setReorderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        for (const rid of prev) {
          if (rid.startsWith(id + '::')) next.delete(rid);
        }
      }
      return next;
    });
    flashRemoved(id);
  }, [flashRemoved]);

  return (
    <main className="container page">
      <ReorderSummaryCards reorderItems={reorderItems} plannerFilter={plannerFilter} onPlannerChange={setPlannerFilter} planners={planners} />
      <hr className="divider" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        {fetchError && <span className="text-error" style={{ fontSize: 'var(--text-caption)' }}>{fetchError}</span>}
        <button className="btn-fetch" onClick={() => handleFetch(yearFilter === 'all' ? 2026 : Number(yearFilter))} disabled={loading} style={{ marginLeft: 'auto' }}>
          {loading ? '조회 중...' : '조회'}
        </button>
      </div>

      <div>
        <div className="flex-between mb-2">
          <h2 className="section-title">리오더 확정</h2>
          <span className="text-muted" style={{ fontSize: 'var(--text-overline)' }}>{reorderItems.length}건</span>
        </div>
        <ReorderQuantityGrid items={reorderItems} onRemove={handleRemoveReorder} highlightId={highlightAddedId} viewportClass="grid-viewport-half" />
      </div>

      <section style={{ marginTop: 'var(--space-3)' }}>
        <ReorderDetailTable items={displayItems} onToggleReorder={handleToggleReorder} reorderIds={reorderIds} highlightId={highlightRemovedId} yearFilter={yearFilter} onYearChange={setYearFilter} viewportClass="grid-viewport-tall" />
      </section>
    </main>
  );
}
