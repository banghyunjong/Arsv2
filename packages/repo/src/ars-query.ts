/**
 * @arsv2/repo — ARS detail query (CSV fallback, Snowflake 접속 이슈로 임시 전환)
 */

import * as fs from 'fs';
import * as path from 'path';
import type { SnowflakeConfig } from '@arsv2/config';

// docs/ 폴더 위치 (환경별 fallback)
// Vercel: process.cwd() = /var/task, includeFiles로 docs/ 포함됨
// 로컬: __dirname = packages/repo/dist → 3단계 위 = 모노레포 루트
const DOCS_DIR = (() => {
  const cwdDocs = path.resolve(process.cwd(), 'docs');
  try { fs.accessSync(cwdDocs); return cwdDocs; } catch { /* 없으면 fallback */ }
  return path.resolve(__dirname, '..', '..', '..', 'docs');
})();

export interface ArsColorRow {
  year: number;              // 연도 (25, 26)
  season: string;            // 시즌
  garmentType: string;       // 복종
  itemName: string;          // 아이템
  planner: string;           // 기획자
  styleCode: string;         // 스타일코드
  styleName: string;         // 스타일명
  colorCode: string;         // 컬러코드
  actualSalesQty: number;    // 누적판매량
  sellThroughTarget: number | null; // 현시점 소진율 목표
  sellThroughActual: number; // 현시점 소진율 실적
  achievementRate: number | null;   // 목표달성율
  weeklySellThrough: number; // 주판율(액기준)
  weeklySalesVolume: number; // 주판량
  costRate: number | null;   // 사후원가율
  reorderQuantity: number;   // 상품유형_리오더수량(기본값)
  supplierName: string | null; // 공급업체명 (vendor CSV JOIN)
}

function num(v: unknown): number {
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  if (typeof v === 'string') { const n = Number(v); return isNaN(n) ? 0 : n; }
  return 0;
}
const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));
function numOrNull(v: unknown): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return isNaN(v) ? null : v;
  if (typeof v === 'string') { const n = Number(v); return isNaN(n) ? null : n; }
  return null;
}

function mapRow(r: Record<string, unknown>): ArsColorRow {
  return {
    year: num(r['연도']),
    season: str(r['시즌']),
    garmentType: str(r['복종']),
    itemName: str(r['아이템']),
    planner: str(r['기획자']),
    styleCode: str(r['스타일코드']),
    styleName: str(r['스타일명']),
    colorCode: str(r['컬러코드']),
    actualSalesQty: num(r['누적판매량']),
    sellThroughTarget: numOrNull(r['현시점 소진율 목표']),
    sellThroughActual: num(r['현시점 소진율 실적']),
    achievementRate: numOrNull(r['목표달성율']),
    weeklySellThrough: num(r['주판율(액기준)']),
    weeklySalesVolume: num(r['주판량']),
    costRate: numOrNull(r['사후원가율']),
    reorderQuantity: num(r['상품유형_리오더수량(기본값)']),
    supplierName: r['공급업체명'] != null ? str(r['공급업체명']) || null : null,
  };
}

/** 따옴표 안의 쉼표를 처리하는 CSV 행 파서 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  fields.push(current.trim());
  return fields;
}

function parseCsvToRecords(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      record[headers[i]] = values[i] ?? '';
    }
    return record;
  });
}

export async function queryArsDetail(
  _config: SnowflakeConfig,  // 미사용 — API 호환성 유지
  year: number,
): Promise<ArsColorRow[]> {
  const shortYear = year >= 2000 ? year - 2000 : year;

  // 주 데이터 CSV
  const arsText = fs.readFileSync(path.join(DOCS_DIR, 'VIBE_SP_ARS_TEST.csv'), 'utf-8');
  const arsRows = parseCsvToRecords(arsText);

  // 공급업체 CSV → lookup Map (스타일코드::컬러코드 → 공급업체명)
  const vendorText = fs.readFileSync(path.join(DOCS_DIR, 'SP_ARS_TABLE_FOR_ORDER_NUM_VENDOR.csv'), 'utf-8');
  const vendorRows = parseCsvToRecords(vendorText);
  const vendorMap = new Map<string, string>();
  for (const v of vendorRows) {
    const key = `${v['스타일코드']}::${v['컬러코드']}`;
    if (!vendorMap.has(key) && v['공급업체명']) vendorMap.set(key, v['공급업체명']);
  }

  // 연도 필터 → 공급업체명 주입 → ArsColorRow 매핑 → 정렬
  return arsRows
    .filter((r) => Number(r['연도']) === shortYear)
    .map((r) => {
      const key = `${r['스타일코드']}::${r['컬러코드']}`;
      return mapRow({ ...r, 공급업체명: vendorMap.get(key) ?? null });
    })
    .sort((a, b) =>
      a.season.localeCompare(b.season) ||
      a.garmentType.localeCompare(b.garmentType) ||
      a.styleCode.localeCompare(b.styleCode) ||
      a.colorCode.localeCompare(b.colorCode),
    );
}
