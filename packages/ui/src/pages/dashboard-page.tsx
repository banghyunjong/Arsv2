import { useState, useEffect, useMemo, useCallback } from 'react';
import { type ReorderConfirmItem, type DetailGridItem } from '../data/mock-dashboard';
import { fetchArsDetail } from '../data/ars-api';
import { ReorderSummaryCards } from '../components/reorder-summary-cards';
import { ReorderQuantityGrid } from '../components/reorder-quantity-grid';
import { ReorderDetailTable } from '../components/reorder-detail-table';

type Tab = 'detail' | 'reorder';

const MOCK_FACTORIES = ['베트남 A공장', '중국 칭다오', '인도네시아 B공장', '캄보디아 C공장', '미얀마 D공장'];
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
          factory: pickMock(MOCK_FACTORIES, seed),
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
      factory: pickMock(MOCK_FACTORIES, seed),
      planner: parent.planner,
      sourcing: pickMock(MOCK_SOURCING, seed + 3),
      deliveryDate: `2026-${String(5 + (seed % 4)).padStart(2, '0')}-${String(10 + (seed % 20)).padStart(2, '0')}`,
      colors,
    });
  }

  return result;
}

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('detail');
  const [yearFilter, setYearFilter] = useState('2026');
  const [detailItems, setDetailItems] = useState<DetailGridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reorderIds, setReorderIds] = useState<Set<string>>(new Set());

  const handleFetch = useCallback(async (year: number) => {
    setLoading(true);
    setFetchError(null);
    try {
      const items = await fetchArsDetail(year);
      setDetailItems(items);
      setReorderIds(new Set(
        items.filter((item) => item.achievementRate >= 200 && item.costRate < 30).map((item) => item.id),
      ));
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  // 페이지 로딩 시 바로 DB 조회
  useEffect(() => {
    handleFetch(2026);
  }, [handleFetch]);

  const reorderItems = useMemo(() => buildReorderItems(reorderIds, detailItems), [reorderIds, detailItems]);

  // Highlight tracking — persists until next action
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

  // Remove all color-level IDs for a parent (used by reorder grid "제거" button)
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
      <ReorderSummaryCards reorderItems={reorderItems} />
      <hr className="divider" />

      <div className="tab-bar">
        <button
          className={`tab-item${activeTab === 'detail' ? ' active' : ''}`}
          onClick={() => setActiveTab('detail')}
        >
          상세 내역
        </button>
        <button
          className={`tab-item${activeTab === 'reorder' ? ' active' : ''}`}
          onClick={() => setActiveTab('reorder')}
        >
          리오더 확정
          {reorderIds.size > 0 && <span className="tab-badge">{reorderIds.size}</span>}
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {fetchError && <span className="text-error" style={{ fontSize: 'var(--text-caption)' }}>{fetchError}</span>}
          <button className="btn-fetch" onClick={() => handleFetch(yearFilter === 'all' ? 2026 : Number(yearFilter))} disabled={loading}>
            {loading ? '조회 중...' : '조회'}
          </button>
        </div>
      </div>

      {activeTab === 'detail' && (
        <ReorderDetailTable items={detailItems} onToggleReorder={handleToggleReorder} reorderIds={reorderIds} highlightId={highlightRemovedId} yearFilter={yearFilter} onYearChange={setYearFilter} />
      )}
      {activeTab === 'reorder' && (
        <ReorderQuantityGrid items={reorderItems} onRemove={handleRemoveReorder} highlightId={highlightAddedId} />
      )}
    </main>
  );
}
