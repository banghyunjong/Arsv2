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
  supplierName: string | null; // 공급업체명 (PLC JOIN)
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
    supplierName: r['공급업체명'] != null ? str(r['공급업체명']) || null : null,
  };
}

function executeQuery(conn: ReturnType<typeof createSnowflakeConnection>, sql: string, binds?: (string | number)[]): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: sql,
      ...(binds ? { binds } : {}),
      complete: (err, _stmt, rows) => {
        if (err) reject(new Error(`Snowflake query failed: ${err.message}`));
        else resolve((rows ?? []) as Record<string, unknown>[]);
      },
    });
  });
}

export async function queryArsDetail(config: SnowflakeConfig, year: number): Promise<ArsColorRow[]> {
  const conn = createSnowflakeConnection(config);
  const shortYear = year >= 2000 ? year - 2000 : year;

  return new Promise((resolve, reject) => {
    conn.connect(async (err) => {
      if (err) {
        reject(new Error(`Snowflake connection failed: ${err.message}`));
        return;
      }

      try {
        // Debug: TEST 테이블 컬럼 구조 및 연도 분포 확인
        const testSample = await executeQuery(conn,
          `SELECT * FROM RSC.VIBE_SP_ARS_TEST LIMIT 1`);
        if (testSample.length > 0) {
          console.log(JSON.stringify({ level: 'debug', msg: 'VIBE_SP_ARS_TEST columns', keys: Object.keys(testSample[0]) }));
          console.log(JSON.stringify({ level: 'debug', msg: 'VIBE_SP_ARS_TEST sample row', row: testSample[0] }));
        } else {
          console.log(JSON.stringify({ level: 'debug', msg: 'VIBE_SP_ARS_TEST is EMPTY' }));
        }

        // Debug: VENDOR 테이블 컬럼 구조 확인
        const vendorSample = await executeQuery(conn,
          `SELECT * FROM RSC.SP_ARS_TABLE_FOR_ORDER_NUM_VENDOR LIMIT 1`);
        if (vendorSample.length > 0) {
          console.log(JSON.stringify({ level: 'debug', msg: 'VENDOR table columns', keys: Object.keys(vendorSample[0]) }));
          console.log(JSON.stringify({ level: 'debug', msg: 'VENDOR table sample row', row: vendorSample[0] }));
        }

        const yearDist = await executeQuery(conn,
          `SELECT "연도", COUNT(*) AS cnt FROM RSC.VIBE_SP_ARS_TEST GROUP BY "연도" ORDER BY "연도"`);
        console.log(JSON.stringify({ level: 'debug', msg: 'VIBE_SP_ARS_TEST year distribution', years: yearDist, queryYear: shortYear }));

        // Main query — try shortYear first; if 0 rows, try full year
        let rawRows = await executeQuery(conn,
          `WITH FACTORY AS (
             SELECT DISTINCT "스타일코드", "컬러코드", "공급업체명"
             FROM RSC.SP_ARS_TABLE_FOR_ORDER_NUM_VENDOR
           )
           SELECT A.*, F."공급업체명"
           FROM RSC.VIBE_SP_ARS_TEST A
           LEFT JOIN FACTORY F
             ON A."스타일코드" = F."스타일코드"
             AND A."컬러코드" = F."컬러코드"
           WHERE A."연도" = ?
           ORDER BY A."시즌", A."복종", A."스타일코드", A."컬러코드"`,
          [shortYear]);

        if (rawRows.length === 0 && shortYear !== year) {
          console.log(JSON.stringify({ level: 'debug', msg: 'shortYear returned 0 rows, retrying with full year', shortYear, fullYear: year }));
          rawRows = await executeQuery(conn,
            `WITH FACTORY AS (
               SELECT DISTINCT "스타일코드", "컬러코드", "공급업체명"
               FROM RSC.SP_ARS_TABLE_FOR_ORDER_NUM_VENDOR
             )
             SELECT A.*, F."공급업체명"
             FROM RSC.VIBE_SP_ARS_TEST A
             LEFT JOIN FACTORY F
               ON A."스타일코드" = F."스타일코드"
               AND A."컬러코드" = F."컬러코드"
             WHERE A."연도" = ?
             ORDER BY A."시즌", A."복종", A."스타일코드", A."컬러코드"`,
            [year]);
        }

        console.log(JSON.stringify({ level: 'debug', msg: 'Main query result count', count: rawRows.length }));

        if (rawRows.length > 0) {
          const first = rawRows[0];
          console.log(JSON.stringify({ level: 'debug', msg: 'JOIN result first row keys', keys: Object.keys(first) }));
          console.log(JSON.stringify({ level: 'debug', msg: 'JOIN result first row', row: first }));
        }

        const mapped = rawRows.map((r) => mapRow(r));
        await destroyConnection(conn).catch(() => {});
        resolve(mapped);
      } catch (e) {
        await destroyConnection(conn).catch(() => {});
        reject(e);
      }
    });
  });
}
