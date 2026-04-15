/**
 * @arsv2/repo — ARS detail query from Snowflake
 */

import type { SnowflakeConfig } from '@arsv2/config';
import { createSnowflakeConnection, destroyConnection } from './snowflake';

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
}

function num(v: unknown): number {
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  if (typeof v === 'string') { const n = Number(v); return isNaN(n) ? 0 : n; }
  return 0;
}
const str = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));
function numOrNull(v: unknown): number | null {
  if (v == null) return null;
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
  };
}

export async function queryArsDetail(config: SnowflakeConfig, year: number): Promise<ArsColorRow[]> {
  const conn = createSnowflakeConnection(config);
  // UI sends full year (2026), query expects short year (26)
  const shortYear = year >= 2000 ? year - 2000 : year;

  return new Promise((resolve, reject) => {
    conn.connect((err) => {
      if (err) {
        reject(new Error(`Snowflake connection failed: ${err.message}`));
        return;
      }

      conn.execute({
        sqlText: `SELECT * FROM RSC.VIBE_SP_ARS_TEST
                  WHERE "연도" = ?
                  ORDER BY "시즌", "복종", "스타일코드", "컬러코드"`,
        binds: [shortYear],
        complete: async (err, _stmt, rows) => {
          if (err) {
            await destroyConnection(conn).catch(() => {});
            reject(new Error(`Snowflake query failed: ${err.message}`));
            return;
          }

          const rawRows = rows ?? [];
          if (rawRows.length > 0) {
            const first = rawRows[0] as Record<string, unknown>;
            console.log(JSON.stringify({ level: 'debug', msg: 'VIBE_SP_ARS_TEST first row keys', keys: Object.keys(first) }));
            console.log(JSON.stringify({ level: 'debug', msg: 'VIBE_SP_ARS_TEST first row sample', row: first }));
          }
          const mapped = rawRows.map((r) => mapRow(r as Record<string, unknown>));
          await destroyConnection(conn).catch(() => {});
          resolve(mapped);
        },
      });
    });
  });
}
