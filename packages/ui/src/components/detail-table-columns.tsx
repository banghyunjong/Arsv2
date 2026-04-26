import { createColumnHelper } from '@tanstack/react-table';
import type { DetailGridItem, ColorBreakdownItem } from '../data/mock-dashboard';

const col = createColumnHelper<DetailGridItem>();
const colorCol = createColumnHelper<ColorBreakdownItem>();

// ─── Performance Column Sizes (공유) ─────────────────────

export const PERF_SIZES = {
  sellThroughTarget: 80,
  actualSalesQty: 65,
  achievementRate: 65,
  weeklySellThrough: 65,
  weeklySalesVolume: 65,
  costRate: 65,
  adjustedSellingPeriod: 85,
  reorderQuantity: 80,
  thisWeekReorderQty: 90,
  fourWeekReorderQty: 90,
} as const;

const BASIC_TOTAL_WIDTH = 55 + 65 + 65 + 150 + 75 + 105; // 515
export { BASIC_TOTAL_WIDTH };

// ─── Formatters ──────────────────────────────────────────

const fmtPct = (v: number) => `${v.toFixed(1)}%`;
const fmtQty = (v: number) => v.toLocaleString();
const fmtDays = (v: number) => `${v}일`;

// ─── Basic Info Columns (Group 1) ────────────────────────

export function buildBasicInfoColumns(onStyleClick?: (item: DetailGridItem) => void, onFactoryClick?: (item: DetailGridItem) => void) {
  return [
    col.accessor('year', { header: '연도', size: 55, meta: { align: 'center' } }),
    col.accessor('season', { header: '시즌', size: 65, meta: { align: 'center' } }),
    col.accessor('garmentType', { header: '복종', size: 65, meta: { align: 'center' } }),
    col.accessor('itemName', { header: '아이템', size: 150 }),
    col.accessor('styleCode', {
      header: '스타일코드', size: 105,
      cell: (info) => {
        const item = info.row.original;
        return onStyleClick ? (
          <button className="cell-clickable" onClick={() => onStyleClick(item)}>
            <code style={{ fontSize: 'var(--text-overline)' }}>{info.getValue()}</code>
          </button>
        ) : (
          <code style={{ fontSize: 'var(--text-overline)' }}>{info.getValue()}</code>
        );
      },
    }),
    col.accessor('planner', { header: '기획자', size: 75, meta: { align: 'center' } }),
    col.accessor('factoryName', {
      header: '공장', size: 100,
      cell: (info) => {
        const item = info.row.original;
        const value = info.getValue();
        return onFactoryClick ? (
          <button className="cell-clickable" onClick={() => onFactoryClick(item)}>
            {value}
          </button>
        ) : value;
      },
    }),
    col.accessor('reorderRound', {
      header: '차수', size: 50, meta: { align: 'center' },
      cell: (info) => {
        const v = info.getValue();
        return v > 0 ? `${v}차` : '—';
      },
    }),
  ];
}

// ─── Performance Columns (Group 2) ───────────────────────

export function buildPerformanceColumns() {
  return [
    ...buildPerformanceColumnsBase(),
    col.accessor('adjustedSellingPeriod', { header: '보정판매기간', size: PERF_SIZES.adjustedSellingPeriod, meta: { align: 'right' }, cell: (i) => fmtDays(i.getValue()) }),
    col.accessor('reorderQuantity', { header: '리오더수량', size: PERF_SIZES.reorderQuantity, meta: { align: 'right' }, cell: (i) => {
      const v = i.getValue();
      return v > 0 ? <strong>{fmtQty(v)}</strong> : <span className="text-muted">—</span>;
    }}),
  ];
}

function buildPerformanceColumnsBase() {
  return [
    col.accessor('sellThroughTarget', { header: '소진율목표', size: PERF_SIZES.sellThroughTarget, meta: { align: 'right' }, cell: (i) => fmtPct(i.getValue()) }),
    col.accessor('actualSalesQty', { header: '실적', size: PERF_SIZES.actualSalesQty, meta: { align: 'right' }, cell: (i) => fmtQty(i.getValue()) }),
    col.accessor('achievementRate', { header: '달성율', size: PERF_SIZES.achievementRate, meta: { align: 'right' }, cell: (i) => {
      const v = i.getValue();
      const cls = v >= 100 ? 'text-success' : v < 60 ? 'text-error' : '';
      return <span className={cls}>{fmtPct(v)}</span>;
    }}),
    col.accessor('weeklySellThrough', { header: '주판율', size: PERF_SIZES.weeklySellThrough, meta: { align: 'right' }, cell: (i) => fmtPct(i.getValue()) }),
    col.accessor('weeklySalesVolume', { header: '주판량', size: PERF_SIZES.weeklySalesVolume, meta: { align: 'right' }, cell: (i) => fmtQty(i.getValue()) }),
    col.accessor('costRate', { header: '원가율', size: PERF_SIZES.costRate, meta: { align: 'right' }, cell: (i) => fmtPct(i.getValue()) }),
  ];
}

export function calcReorderQuantity(item: DetailGridItem, weeks: number): number {
  return Math.round(item.weeklySalesVolume * weeks);
}

export function buildInteractivePerformanceColumns(
  periodOverrides: Map<string, number>,
  onPeriodChange: (id: string, weeks: number) => void,
  onReorderQtyClick?: (item: DetailGridItem) => void,
) {
  return [
    ...buildPerformanceColumnsBase(),
    col.accessor('adjustedSellingPeriod', {
      header: '보정판매기간',
      size: PERF_SIZES.adjustedSellingPeriod,
      meta: { align: 'center' },
      sortingFn: (a, b) => {
        const wa = periodOverrides.get(a.original.id) ?? 4;
        const wb = periodOverrides.get(b.original.id) ?? 4;
        return wa - wb;
      },
      cell: ({ row }) => {
        const id = row.original.id;
        const weeks = periodOverrides.get(id) ?? 4;
        return (
          <select
            className="period-select"
            value={weeks}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onPeriodChange(id, Number(e.target.value))}
          >
            <option value={1}>1주</option>
            <option value={2}>2주</option>
            <option value={3}>3주</option>
            <option value={4}>4주</option>
            <option value={5}>5주</option>
            <option value={6}>6주</option>
            <option value={7}>7주</option>
            <option value={8}>8주</option>
          </select>
        );
      },
    }),
    col.display({
      id: 'thisWeekReorderQty',
      header: '이번주 리오더',
      size: PERF_SIZES.thisWeekReorderQty,
      meta: { align: 'right' },
      cell: ({ row }) => {
        const item = row.original;
        const qty = item.weeklySalesVolume;
        if (qty <= 0) return <span className="text-muted">—</span>;
        return onReorderQtyClick ? (
          <button className="cell-clickable" onClick={() => onReorderQtyClick(item)}>
            <strong>{fmtQty(qty)}</strong>
          </button>
        ) : <strong>{fmtQty(qty)}</strong>;
      },
    }),
    col.display({
      id: 'fourWeekReorderQty',
      header: '4주 리오더',
      size: PERF_SIZES.fourWeekReorderQty,
      meta: { align: 'right' },
      cell: ({ row }) => {
        const item = row.original;
        const weeks = periodOverrides.get(item.id) ?? 4;
        const qty = item.weeklySalesVolume * weeks;
        if (qty <= 0) return <span className="text-muted">—</span>;
        return onReorderQtyClick ? (
          <button className="cell-clickable" onClick={() => onReorderQtyClick(item)}>
            <strong>{fmtQty(qty)}</strong>
          </button>
        ) : <strong>{fmtQty(qty)}</strong>;
      },
    }),
  ];
}

// ─── Toggle Column ───────────────────────────────────────

export function buildToggleColumn(
  onToggle: (id: string) => void,
  expandedIds: Set<string>,
) {
  return col.display({
    id: 'viewToggle',
    header: '선택',
    size: 70,
    meta: { align: 'center' },
    cell: ({ row }) => {
      const item = row.original;
      if (item.colorBreakdown.length === 0) return null;
      const isColor = expandedIds.has(item.id);
      return (
        <button
          className={`btn-toggle${isColor ? ' active' : ''}`}
          onClick={() => onToggle(item.id)}
        >
          {isColor ? '컬러' : '토탈'}
        </button>
      );
    },
  });
}

// ─── Reorder Select Column ──────────────────────────────

export function buildReorderSelectColumn(onToggle: (id: string) => void, selectedIds: Set<string>) {
  return col.display({
    id: 'reorderSelect',
    header: '리오더',
    size: 80,
    meta: { align: 'center' },
    cell: ({ row }) => {
      const id = row.original.id;
      const isSelected = selectedIds.has(id);
      return (
        <button
          className={`btn-reorder-select${isSelected ? ' selected' : ''}`}
          onClick={() => onToggle(id)}
        >
          {isSelected ? '선택됨' : '리오더 선택'}
        </button>
      );
    },
  });
}

// ─── Reorder Remove Column ──────────────────────────────

export function buildReorderRemoveColumn(onRemove: (id: string) => void) {
  return col.display({
    id: 'reorderRemove',
    header: '제거',
    size: 70,
    meta: { align: 'center' },
    cell: ({ row }) => (
      <button
        className="btn-toggle"
        onClick={() => onRemove(row.original.id)}
      >
        제거
      </button>
    ),
  });
}

// ─── Color Sub-Grid Columns ──────────────────────────────

export function buildColorPerformanceColumns() {
  return [
    colorCol.accessor('sellThroughTarget', { header: '소진율목표', size: PERF_SIZES.sellThroughTarget, cell: (i) => fmtPct(i.getValue()) }),
    colorCol.accessor('actualSalesQty', { header: '실적', size: PERF_SIZES.actualSalesQty, cell: (i) => fmtQty(i.getValue()) }),
    colorCol.accessor('achievementRate', { header: '달성율', size: PERF_SIZES.achievementRate, cell: (i) => {
      const v = i.getValue();
      const cls = v >= 100 ? 'text-success' : v < 60 ? 'text-error' : '';
      return <span className={cls}>{fmtPct(v)}</span>;
    }}),
    colorCol.accessor('weeklySellThrough', { header: '주판율', size: PERF_SIZES.weeklySellThrough, cell: (i) => fmtPct(i.getValue()) }),
    colorCol.accessor('weeklySalesVolume', { header: '주판량', size: PERF_SIZES.weeklySalesVolume, cell: (i) => fmtQty(i.getValue()) }),
    colorCol.accessor('costRate', { header: '원가율', size: PERF_SIZES.costRate, cell: (i) => fmtPct(i.getValue()) }),
    colorCol.accessor('adjustedSellingPeriod', { header: '보정판매기간', size: PERF_SIZES.adjustedSellingPeriod, cell: (i) => fmtDays(i.getValue()) }),
    colorCol.accessor('reorderQuantity', { header: '리오더수량', size: PERF_SIZES.reorderQuantity, cell: (i) => {
      const v = i.getValue();
      return v > 0 ? <strong>{fmtQty(v)}</strong> : <span className="text-muted">—</span>;
    }}),
  ];
}
