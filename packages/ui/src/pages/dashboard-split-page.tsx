import { useState, useEffect, useMemo, useCallback } from 'react';
import { type ReorderConfirmItem, type DetailGridItem } from '../data/mock-dashboard';
import { fetchArsDetail } from '../data/ars-api';
import { loadPinnedReorderItems } from '../data/reorder-csv';
import { ReorderSummaryCards } from '../components/reorder-summary-cards';
import { ReorderQuantityGrid } from '../components/reorder-quantity-grid';
import { ReorderDetailTable } from '../components/reorder-detail-table';
import { FactoryFabricGrid } from '../components/factory-fabric-grid';

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
        const w1 = Math.ceil(totalQty * 0.5);
        const w2 = Math.ceil(totalQty * 0.3);
        const w3 = Math.max(0, totalQty - w1 - w2);
        const seed = item.id.charCodeAt(item.id.length - 1);
        result.push({
          id: item.id,
          styleCode: item.styleCode,
          quantity: totalQty,
          orderAmount: totalQty * unitPrice,
          totalReorderQty: totalQty,
          w1, w2, w3,
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
    const w1 = Math.ceil(totalQty * 0.5);
    const w2 = Math.ceil(totalQty * 0.3);
    const w3 = Math.max(0, totalQty - w1 - w2);
    const seed = parent.id.charCodeAt(parent.id.length - 1);

    result.push({
      id: parentId,
      styleCode: parent.styleCode,
      quantity: totalQty,
      orderAmount: totalQty * unitPrice,
      totalReorderQty: totalQty,
      w1, w2, w3,
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
  // HARDCODED: CSV 기반 고정 리오더 (제거 시 csvItems 상태 + useEffect + reorderItems 병합 로직 삭제)
  const [csvItems, setCsvItems] = useState<ReorderConfirmItem[]>([]);

  useEffect(() => {
    loadPinnedReorderItems().then(setCsvItems);
  }, []);

  const handleFetch = useCallback(async (year: number) => {
    setLoading(true);
    setFetchError(null);
    try {
      const items = await fetchArsDetail(year);
      setDetailItems(items);
      const autoIds = items.filter((item) => item.achievementRate >= 200 && item.costRate < 35 && item.reorderQuantity > 0).map((item) => item.id);
      setReorderIds(new Set(autoIds));
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

  const reorderItems = useMemo(() => {
    const userItems = buildReorderItems(reorderIds, displayItems);
    // HARDCODED: CSV 고정 항목을 맨 앞에 배치, 중복 제거
    const csvCodes = new Set(csvItems.map((i) => i.styleCode));
    return [...csvItems, ...userItems.filter((i) => !csvCodes.has(i.styleCode))];
  }, [reorderIds, displayItems, csvItems]);

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

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <div style={{ flex: '6 1 0', minWidth: 0, overflow: 'hidden' }}>
          <div className="flex-between mb-2">
            <h2 className="section-title">리오더 확정</h2>
            <span className="text-muted" style={{ fontSize: 'var(--text-overline)' }}>{reorderItems.length}건</span>
          </div>
          <ReorderQuantityGrid items={reorderItems} onRemove={handleRemoveReorder} highlightId={highlightAddedId} viewportClass="grid-viewport-half" />
        </div>
        <div style={{ flex: '4 1 0', minWidth: 0 }}>
          <FactoryFabricGrid viewportClass="grid-viewport-half" />
        </div>
      </div>

      <section style={{ marginTop: 'var(--space-3)' }}>
        <ReorderDetailTable items={displayItems} onToggleReorder={handleToggleReorder} reorderIds={reorderIds} highlightId={highlightRemovedId} yearFilter={yearFilter} onYearChange={setYearFilter} viewportClass="grid-viewport-tall" />
      </section>
    </main>
  );
}
