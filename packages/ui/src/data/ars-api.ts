/**
 * Fetch ARS detail data from Snowflake API and map to DetailGridItem[]
 */

import type { DetailGridItem, ColorBreakdownItem } from './mock-dashboard';

interface ArsColorRow {
  year: number;
  season: string;
  garmentType: string;
  itemName: string;
  planner: string;
  styleCode: string;
  styleName: string;
  colorCode: string;
  actualSalesQty: number;
  sellThroughTarget: number | null;
  sellThroughActual: number;
  achievementRate: number | null;
  weeklySellThrough: number;
  weeklySalesVolume: number;
  costRate: number | null;
  reorderQuantity: number;
}

// ─── Color code → hex mapping ─────────────────────────────

const COLOR_MAP: Record<string, string> = {
  black: '#111111', 블랙: '#111111',
  white: '#FAFAFA', 화이트: '#FAFAFA',
  ivory: '#FFFFF0', 아이보리: '#FFFFF0',
  cream: '#F5F0E1', 크림: '#F5F0E1',
  beige: '#D4C5A9', 베이지: '#D4C5A9',
  navy: '#1B2A4A', 네이비: '#1B2A4A',
  grey: '#A0A0A0', gray: '#A0A0A0', 그레이: '#A0A0A0',
  charcoal: '#4A4A4A', 차콜: '#4A4A4A',
  red: '#C0392B', 레드: '#C0392B',
  blue: '#4A90D9', 블루: '#4A90D9',
  pink: '#F0B4B4', 핑크: '#F0B4B4',
  green: '#27AE60', 그린: '#27AE60',
  olive: '#6B7B3A', 올리브: '#6B7B3A',
  khaki: '#8B7D6B', 카키: '#8B7D6B',
  burgundy: '#722F37', 버건디: '#722F37',
  brown: '#8B4513', 브라운: '#8B4513',
  orange: '#E67E22', 오렌지: '#E67E22',
  yellow: '#F1C40F', 옐로우: '#F1C40F',
  purple: '#8E44AD', 퍼플: '#8E44AD',
  lavender: '#B39DDB', 라벤더: '#B39DDB',
  mint: '#98D4BB', 민트: '#98D4BB',
  coral: '#E8836B', 코랄: '#E8836B',
  wine: '#722F37', 와인: '#722F37',
  indigo: '#3F5277', 인디고: '#3F5277',
};

function colorNameToHex(name: string): string {
  const lower = name.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return hex;
  }
  // hash-based fallback
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 55%)`;
}

// ─── Ratio → percentage (1 decimal) ──────────────────────

function ratioToPct(v: number | null): number {
  if (v == null) return 0;
  return Math.round(v * 1000) / 10; // 0.885 → 88.5
}

// ─── Map rows → DetailGridItem[] ──────────────────────────

function mapColorRow(row: ArsColorRow): ColorBreakdownItem {
  return {
    colorName: row.colorCode,
    colorCode: colorNameToHex(row.colorCode),
    sellThroughTarget: ratioToPct(row.sellThroughTarget),
    actualSalesQty: row.actualSalesQty,
    achievementRate: ratioToPct(row.achievementRate),
    weeklySellThrough: ratioToPct(row.weeklySellThrough),
    weeklySalesVolume: row.weeklySalesVolume,
    costRate: ratioToPct(row.costRate),
    adjustedSellingPeriod: 0,
    reorderQuantity: row.reorderQuantity,
  };
}

// ─── Season display mapping ──────────────────────────────

function formatSeason(year: number, season: string): string {
  const y = String(year).padStart(2, '0');
  if (year >= 26) return `SS${y}`;
  if (year >= 25) return `FW${y}`;
  if (season) return `${season}${y}`;
  return y;
}

function groupToDetailItems(rows: ArsColorRow[], year: number): DetailGridItem[] {
  const groups = new Map<string, ArsColorRow[]>();
  for (const row of rows) {
    const key = row.styleCode;
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  const items: DetailGridItem[] = [];
  let idx = 0;

  for (const [styleCode, colorRows] of groups) {
    const first = colorRows[0];
    const season = formatSeason(first.year, first.season);
    const colorBreakdown = colorRows.map(mapColorRow);

    const totalSalesQty = colorBreakdown.reduce((s, c) => s + c.actualSalesQty, 0);
    const totalWeeklyVolume = colorBreakdown.reduce((s, c) => s + c.weeklySalesVolume, 0);
    const avgAchievement = colorBreakdown.length > 0
      ? colorBreakdown.reduce((s, c) => s + c.achievementRate, 0) / colorBreakdown.length
      : 0;
    const avgWeeklySellThrough = colorBreakdown.length > 0
      ? colorBreakdown.reduce((s, c) => s + c.weeklySellThrough, 0) / colorBreakdown.length
      : 0;
    const avgCostRate = colorBreakdown.length > 0
      ? colorBreakdown.reduce((s, c) => s + c.costRate, 0) / colorBreakdown.length
      : 0;
    const totalReorderQty = colorBreakdown.reduce((s, c) => s + c.reorderQuantity, 0);
    const avgTarget = colorBreakdown.length > 0
      ? colorBreakdown.reduce((s, c) => s + c.sellThroughTarget, 0) / colorBreakdown.length
      : 0;

    items.push({
      id: `SF-${String(idx++).padStart(3, '0')}`,
      year,
      season,
      garmentType: first.garmentType,
      itemName: first.itemName,
      planner: first.planner,
      styleCode,
      sellThroughTarget: Math.round(avgTarget * 10) / 10,
      actualSalesQty: totalSalesQty,
      achievementRate: Math.round(avgAchievement * 10) / 10,
      weeklySellThrough: Math.round(avgWeeklySellThrough * 10) / 10,
      weeklySalesVolume: totalWeeklyVolume,
      costRate: Math.round(avgCostRate * 10) / 10,
      adjustedSellingPeriod: 0,
      reorderQuantity: totalReorderQty,
      colorBreakdown,
    });
  }

  return items;
}

// ─── API fetch ────────────────────────────────────────────

export async function fetchArsDetail(year: number): Promise<DetailGridItem[]> {
  const res = await fetch(`/api/ars/detail?year=${year}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const body = await res.json();
  if (!body.success) throw new Error(body.error || 'Unknown API error');
  return groupToDetailItems(body.data as ArsColorRow[], year);
}
