/**
 * HARDCODED: CSV 기반 고정 리오더 데이터 로더
 * 제거 시 이 파일 삭제 + dashboard 페이지에서 loadPinnedReorderItems 호출 제거
 */

import type { ReorderConfirmItem, ReorderColorRow } from './mock-dashboard';

interface CsvRow {
  styleName: string;
  styleCode: string;
  colorCode: string;
  reorderW: number;
  deliveryDate: string;
  totalReorderQty: number;
  w1: number;
  w2: number;
  w3: number;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { fields.push(current); current = ''; continue; }
    current += ch;
  }
  fields.push(current);
  return fields;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  // skip header
  return lines.slice(1).map((line) => {
    const f = parseCsvLine(line);
    return {
      styleName: f[0]?.trim() ?? '',
      styleCode: f[1]?.trim() ?? '',
      colorCode: f[2]?.trim() ?? '',
      reorderW: Number(f[3]) || 0,
      deliveryDate: f[4]?.trim() ?? '',
      totalReorderQty: Number(f[5]) || 0,
      w1: Number(f[6]) || 0,
      w2: Number(f[7]) || 0,
      w3: Number(f[8]) || 0,
    };
  });
}

function groupToReorderItems(rows: CsvRow[]): ReorderConfirmItem[] {
  const groups = new Map<string, CsvRow[]>();
  for (const row of rows) {
    if (!row.styleCode) continue;
    if (!groups.has(row.styleCode)) groups.set(row.styleCode, []);
    groups.get(row.styleCode)!.push(row);
  }

  const items: ReorderConfirmItem[] = [];
  for (const [styleCode, colorRows] of groups) {
    const first = colorRows[0];
    const colors: ReorderColorRow[] = colorRows.map((r) => {
      // 컬러코드: 통합_컬러코드에서 통합코드 접두사 제거
      const colorSuffix = r.colorCode.startsWith(styleCode)
        ? r.colorCode.slice(styleCode.length)
        : r.colorCode;
      return {
        colorName: colorSuffix || r.colorCode,
        colorCode: '#999999',
        quantity: r.reorderW,
        orderAmount: 0,
        totalReorderQty: r.totalReorderQty,
        w1: r.w1,
        w2: r.w2,
        w3: r.w3,
        deliveryDate: r.deliveryDate,
      };
    });

    const totalQty = colors.reduce((s, c) => s + c.quantity, 0);
    const totalReorder = colors.reduce((s, c) => s + (c.totalReorderQty ?? 0), 0);
    const totalW1 = colors.reduce((s, c) => s + (c.w1 ?? 0), 0);
    const totalW2 = colors.reduce((s, c) => s + (c.w2 ?? 0), 0);
    const totalW3 = colors.reduce((s, c) => s + (c.w3 ?? 0), 0);
    const earliestDate = colorRows.find((r) => r.deliveryDate)?.deliveryDate ?? '';

    items.push({
      id: `CSV-${styleCode}`,
      styleCode,
      styleName: first.styleName,
      quantity: totalQty,
      orderAmount: 0,
      totalReorderQty: totalReorder,
      w1: totalW1,
      w2: totalW2,
      w3: totalW3,
      factory: '',
      planner: '',
      sourcing: '',
      deliveryDate: earliestDate,
      colors,
    });
  }

  return items;
}

let _cache: ReorderConfirmItem[] | null = null;

export async function loadPinnedReorderItems(): Promise<ReorderConfirmItem[]> {
  if (_cache) return _cache;
  try {
    const res = await fetch('/data/reorder-pinned_2.csv');
    if (!res.ok) throw new Error(`CSV load failed: ${res.status}`);
    const text = await res.text();
    _cache = groupToReorderItems(parseCsv(text));
    return _cache;
  } catch (e) {
    console.warn('Failed to load pinned reorder CSV:', e);
    return [];
  }
}
