import { useState, useMemo, useRef, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type Row,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { DetailGridItem } from '../data/mock-dashboard';
import { buildBasicInfoColumns, buildInteractivePerformanceColumns, buildToggleColumn, buildReorderSelectColumn } from './detail-table-columns';
import { ColorBreakdownGrid } from './color-breakdown-grid';

interface Props {
  items: DetailGridItem[];
  onToggleReorder?: (id: string) => void;
  reorderIds?: Set<string>;
  highlightId?: string | null;
  yearFilter: string;
  onYearChange: (v: string) => void;
  viewportClass?: string;
}

const col = createColumnHelper<DetailGridItem>();

// ─── Unique filter values ────────────────────────────────

function unique<T>(items: T[], key: (i: T) => string): string[] {
  return [...new Set(items.map(key))].sort();
}

export function ReorderDetailTable({ items, onToggleReorder, reorderIds, highlightId, yearFilter, onYearChange, viewportClass }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [garmentFilter, setGarmentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [colorExpandedIds, setColorExpandedIds] = useState<Set<string>>(new Set());
  const [periodOverrides, setPeriodOverrides] = useState<Map<string, number>>(new Map());

  const handlePeriodChange = useCallback((id: string, weeks: number) => {
    setPeriodOverrides((prev) => new Map(prev).set(id, weeks));
  }, []);

  const toggleColor = useCallback((id: string) => {
    setColorExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (yearFilter !== 'all' && String(item.year) !== yearFilter) return false;
      if (seasonFilter !== 'all' && item.season !== seasonFilter) return false;
      if (garmentFilter !== 'all' && item.garmentType !== garmentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return item.itemName.toLowerCase().includes(q) || item.styleCode.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, yearFilter, seasonFilter, garmentFilter, search]);

  const years = useMemo(() => unique(items, (i) => String(i.year)), [items]);
  const seasons = useMemo(() => unique(items, (i) => i.season), [items]);
  const garmentTypes = useMemo(() => unique(items, (i) => i.garmentType), [items]);

  const columns = useMemo(() => [
    col.group({
      id: 'basic-info',
      header: '기본정보',
      columns: buildBasicInfoColumns(),
    }),
    col.group({
      id: 'performance',
      header: '성과 / 리오더',
      columns: [
        ...buildInteractivePerformanceColumns(periodOverrides, handlePeriodChange),
        buildToggleColumn(toggleColor, colorExpandedIds),
        ...(onToggleReorder && reorderIds ? [buildReorderSelectColumn(onToggleReorder, reorderIds)] : []),
      ],
    }),
  ], [toggleColor, colorExpandedIds, onToggleReorder, reorderIds, periodOverrides, handlePeriodChange]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = rows[index]?.original;
      if (item && colorExpandedIds.has(item.id)) {
        return 28 + item.colorBreakdown.length * 22 + 8;
      }
      return 28;
    },
    overscan: 10,
  });

  return (
    <section>
      <div className="flex-between mb-2">
        <h2 className="section-title">상세 내역</h2>
        <span className="text-muted" style={{ fontSize: 'var(--text-overline)' }}>{filtered.length}건</span>
      </div>

      <Filters
        yearFilter={yearFilter} seasonFilter={seasonFilter} garmentFilter={garmentFilter} search={search}
        years={years} seasons={seasons} garmentTypes={garmentTypes}
        onYearChange={onYearChange} onSeasonChange={setSeasonFilter} onGarmentChange={setGarmentFilter} onSearchChange={setSearch}
      />

      <div ref={parentRef} className={viewportClass || "grid-viewport"}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          <table className="table grid-table">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const meta = header.column.columnDef.meta as { align?: string; borderRight?: boolean } | undefined;
                    const isGroup = header.isPlaceholder === false && header.subHeaders.length > 0;
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={[
                          meta?.align === 'right' ? 'table-num' : '',
                          meta?.align === 'center' ? 'text-center' : '',
                          meta?.borderRight ? 'col-group-separator' : '',
                          isGroup ? 'col-group-header' : '',
                        ].filter(Boolean).join(' ')}
                        style={{
                          width: header.getSize(),
                          cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {!isGroup && ({ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? '')}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {virtualizer.getVirtualItems().map((vRow) => {
                const row = rows[vRow.index] as Row<DetailGridItem>;
                const item = row.original;
                const isExpanded = colorExpandedIds.has(item.id);
                return (
                  <VirtualRow key={row.id} row={row} vRow={vRow} isExpanded={isExpanded} item={item} trailingWidth={onToggleReorder ? 150 : 70} onToggleReorder={onToggleReorder} reorderIds={reorderIds} highlightId={highlightId} />
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 14} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>
                    조건에 맞는 항목이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Filters ────────────────────────────────────────────────

interface FilterProps {
  yearFilter: string;
  seasonFilter: string;
  garmentFilter: string;
  search: string;
  years: string[];
  seasons: string[];
  garmentTypes: string[];
  onYearChange: (v: string) => void;
  onSeasonChange: (v: string) => void;
  onGarmentChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

function Filters({ yearFilter, seasonFilter, garmentFilter, search, years, seasons, garmentTypes, onYearChange, onSeasonChange, onGarmentChange, onSearchChange }: FilterProps) {
  return (
    <div className="filter-bar mb-2">
      <select className="filter-select" value={yearFilter} onChange={(e) => onYearChange(e.target.value)}>
        <option value="all">전체 연도</option>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select className="filter-select" value={seasonFilter} onChange={(e) => onSeasonChange(e.target.value)}>
        <option value="all">전체 시즌</option>
        {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="filter-select" value={garmentFilter} onChange={(e) => onGarmentChange(e.target.value)}>
        <option value="all">전체 복종</option>
        {garmentTypes.map((g) => <option key={g} value={g}>{g}</option>)}
      </select>
      <input className="filter-search" type="text" placeholder="아이템 또는 스타일코드 검색" value={search} onChange={(e) => onSearchChange(e.target.value)} />
    </div>
  );
}

// ─── Virtual Row ────────────────────────────────────────────

interface VirtualRowProps {
  row: Row<DetailGridItem>;
  vRow: { index: number; start: number; size: number };
  isExpanded: boolean;
  item: DetailGridItem;
  trailingWidth: number;
  onToggleReorder?: (id: string) => void;
  reorderIds?: Set<string>;
  highlightId?: string | null;
}

function VirtualRow({ row, vRow, isExpanded, item, trailingWidth, onToggleReorder, reorderIds, highlightId }: VirtualRowProps) {
  const isHighlighted = item.id === highlightId;
  return (
    <>
      <tr style={{ height: 28 }} className={isHighlighted ? 'row-highlight-removed' : ''}>
        {row.getVisibleCells().map((cell) => {
          const meta = cell.column.columnDef.meta as { align?: string; borderRight?: boolean } | undefined;
          return (
            <td
              key={cell.id}
              className={[
                meta?.align === 'right' ? 'table-num' : '',
                meta?.align === 'center' ? 'text-center' : '',
                meta?.borderRight ? 'col-group-separator' : '',
              ].filter(Boolean).join(' ')}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
      </tr>
      {isExpanded && (
        <tr className="color-breakdown-row">
          <td colSpan={row.getVisibleCells().length}>
            <ColorBreakdownGrid
              items={item.colorBreakdown}
              trailingWidth={trailingWidth}
              parentId={item.id}
              onToggleReorder={onToggleReorder}
              reorderIds={reorderIds}
            />
          </td>
        </tr>
      )}
    </>
  );
}
