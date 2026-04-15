// ─── View-Model Types (UI-local) ───────────────────────────

export interface PerformanceMetrics {
  sellThroughTarget: number;    // 소진율목표 (%)
  actualSalesQty: number;       // 실적 (수량)
  achievementRate: number;      // 달성율 (%)
  weeklySellThrough: number;    // 주판율 (%)
  weeklySalesVolume: number;    // 주판량 (수량)
  costRate: number;             // 원가율 (%)
  adjustedSellingPeriod: number;// 보정판매기간 (일)
  reorderQuantity: number;      // 리오더수량
}

export interface ColorBreakdownItem extends PerformanceMetrics {
  colorName: string;            // '블랙', '화이트'
  colorCode: string;            // '#111111' (스워치용)
  supplierName?: string;        // 공급업체명 (PLC 테이블)
}

export interface DetailGridItem extends PerformanceMetrics {
  id: string;
  year: number;
  season: string;               // 'SS26', 'FW25'
  garmentType: string;          // '니트류', '우븐', '저지'
  itemName: string;
  planner: string;
  styleCode: string;
  colorBreakdown: ColorBreakdownItem[];
}

// ─── Reorder Confirm Types ─────────────────────────────────

export interface ReorderColorRow {
  colorName: string;
  colorCode: string;
  quantity: number;
  orderAmount: number;
}

export interface ReorderConfirmItem {
  id: string;
  styleCode: string;
  quantity: number;
  orderAmount: number;
  factory: string;
  planner: string;
  sourcing: string;
  deliveryDate: string;
  colors: ReorderColorRow[];
}

export interface DashboardMetrics {
  totalPendingItems: number;
  criticalItems: number;
  lowItems: number;
  thisWeekReorderQuantity: number;
  projectedReorderQuantity: number;
  totalReorderValue: number;
}

// ─── Mock Data ─────────────────────────────────────────────

function colors(...items: [string, string, number, number, number, number, number, number, number, number][]): ColorBreakdownItem[] {
  return items.map(([colorName, colorCode, stt, aq, ar, ws, wv, cr, asp, rq]) => ({
    colorName, colorCode,
    sellThroughTarget: stt, actualSalesQty: aq, achievementRate: ar,
    weeklySellThrough: ws, weeklySalesVolume: wv, costRate: cr,
    adjustedSellingPeriod: asp, reorderQuantity: rq,
  }));
}

export const MOCK_DETAIL_ITEMS: DetailGridItem[] = [
  // ── SS26 니트류 ──
  { id: 'D-001', year: 2026, season: 'SS26', garmentType: '니트류', itemName: '에어리 쿨링 반팔니트', planner: '김지현', styleCode: 'SP26S-KNT-001',
    sellThroughTarget: 78, actualSalesQty: 1240, achievementRate: 88.5, weeklySellThrough: 5.2, weeklySalesVolume: 310, costRate: 42, adjustedSellingPeriod: 45, reorderQuantity: 200,
    colorBreakdown: colors(['블랙', '#111111', 78, 480, 92.3, 6.1, 120, 42, 42, 80], ['화이트', '#FAFAFA', 78, 390, 85.7, 5.0, 98, 42, 48, 70], ['네이비', '#1B2A4A', 78, 370, 87.6, 4.5, 92, 42, 45, 50]) },

  { id: 'D-002', year: 2026, season: 'SS26', garmentType: '니트류', itemName: '크루넥 서머 니트', planner: '김지현', styleCode: 'SP26S-KNT-002',
    sellThroughTarget: 75, actualSalesQty: 860, achievementRate: 72.1, weeklySellThrough: 3.8, weeklySalesVolume: 215, costRate: 44, adjustedSellingPeriod: 52, reorderQuantity: 150,
    colorBreakdown: colors(['크림', '#F5F0E1', 75, 320, 78.2, 4.2, 80, 44, 50, 60], ['베이지', '#D4C5A9', 75, 290, 69.5, 3.5, 73, 44, 55, 50], ['차콜', '#4A4A4A', 75, 250, 68.5, 3.6, 62, 44, 52, 40]) },

  // ── SS26 우븐 ──
  { id: 'D-003', year: 2026, season: 'SS26', garmentType: '우븐', itemName: '스트라이프 옥스포드 셔츠', planner: '이수민', styleCode: 'SP26S-WVN-001',
    sellThroughTarget: 72, actualSalesQty: 680, achievementRate: 65.3, weeklySellThrough: 3.2, weeklySalesVolume: 170, costRate: 38, adjustedSellingPeriod: 60, reorderQuantity: 120,
    colorBreakdown: colors(['블루', '#4A90D9', 72, 280, 72.1, 3.8, 70, 38, 55, 50], ['화이트', '#FAFAFA', 72, 250, 64.1, 3.0, 63, 38, 62, 40], ['핑크', '#F0B4B4', 72, 150, 59.7, 2.8, 37, 38, 65, 30]) },

  { id: 'D-004', year: 2026, season: 'SS26', garmentType: '우븐', itemName: '린넨 블렌드 반팔셔츠', planner: '이수민', styleCode: 'SP26S-WVN-002',
    sellThroughTarget: 80, actualSalesQty: 1050, achievementRate: 91.2, weeklySellThrough: 6.5, weeklySalesVolume: 263, costRate: 40, adjustedSellingPeriod: 38, reorderQuantity: 180,
    colorBreakdown: colors(['아이보리', '#FFFFF0', 80, 420, 95.4, 7.2, 105, 40, 35, 80], ['베이지', '#D4C5A9', 80, 350, 88.6, 6.0, 88, 40, 40, 60], ['올리브', '#6B7B3A', 80, 280, 89.7, 6.3, 70, 40, 38, 40]) },

  // ── SS26 저지 ──
  { id: 'D-005', year: 2026, season: 'SS26', garmentType: '저지', itemName: '오버핏 반팔 티셔츠', planner: '박준영', styleCode: 'SP26S-JSY-001',
    sellThroughTarget: 85, actualSalesQty: 2100, achievementRate: 105.2, weeklySellThrough: 7.8, weeklySalesVolume: 525, costRate: 35, adjustedSellingPeriod: 28, reorderQuantity: 350,
    colorBreakdown: colors(['블랙', '#111111', 85, 680, 112.3, 8.5, 170, 35, 25, 120], ['화이트', '#FAFAFA', 85, 620, 108.1, 8.0, 155, 35, 27, 100], ['그레이', '#A0A0A0', 85, 450, 97.8, 7.2, 113, 35, 30, 80], ['네이비', '#1B2A4A', 85, 350, 92.5, 6.5, 87, 35, 32, 50]) },

  { id: 'D-006', year: 2026, season: 'SS26', garmentType: '저지', itemName: '피그먼트 워싱 반팔티', planner: '박준영', styleCode: 'SP26S-JSY-002',
    sellThroughTarget: 70, actualSalesQty: 580, achievementRate: 62.4, weeklySellThrough: 2.9, weeklySalesVolume: 145, costRate: 37, adjustedSellingPeriod: 65, reorderQuantity: 80,
    colorBreakdown: colors(['올리브', '#6B7B3A', 70, 220, 68.7, 3.2, 55, 37, 60, 35], ['차콜', '#4A4A4A', 70, 190, 59.3, 2.7, 48, 37, 68, 25], ['버건디', '#722F37', 70, 170, 59.1, 2.8, 42, 37, 67, 20]) },

  // ── SS26 데님 ──
  { id: 'D-007', year: 2026, season: 'SS26', garmentType: '데님', itemName: '스트레이트 데님 팬츠', planner: '최서윤', styleCode: 'SP26S-DNM-001',
    sellThroughTarget: 75, actualSalesQty: 920, achievementRate: 81.7, weeklySellThrough: 4.5, weeklySalesVolume: 230, costRate: 45, adjustedSellingPeriod: 48, reorderQuantity: 160,
    colorBreakdown: colors(['인디고', '#3F5277', 75, 380, 88.3, 5.2, 95, 45, 44, 70], ['블루', '#4A90D9', 75, 310, 79.4, 4.3, 78, 45, 50, 55], ['블랙', '#111111', 75, 230, 77.3, 4.0, 57, 45, 52, 35]) },

  { id: 'D-008', year: 2026, season: 'SS26', garmentType: '데님', itemName: '와이드 핏 데님', planner: '최서윤', styleCode: 'SP26S-DNM-002',
    sellThroughTarget: 70, actualSalesQty: 740, achievementRate: 74.8, weeklySellThrough: 3.6, weeklySalesVolume: 185, costRate: 47, adjustedSellingPeriod: 55, reorderQuantity: 100,
    colorBreakdown: colors(['라이트블루', '#A4C8E1', 70, 310, 81.5, 4.2, 78, 47, 50, 45], ['인디고', '#3F5277', 70, 260, 72.2, 3.4, 65, 47, 57, 35], ['블랙', '#111111', 70, 170, 68.8, 3.1, 42, 47, 60, 20]) },

  // ── SS26 아우터 ──
  { id: 'D-009', year: 2026, season: 'SS26', garmentType: '아우터', itemName: '라이트 윈드브레이커', planner: '한도윤', styleCode: 'SP26S-OTR-001',
    sellThroughTarget: 68, actualSalesQty: 420, achievementRate: 58.3, weeklySellThrough: 2.4, weeklySalesVolume: 105, costRate: 48, adjustedSellingPeriod: 72, reorderQuantity: 60,
    colorBreakdown: colors(['블랙', '#111111', 68, 180, 64.2, 2.8, 45, 48, 68, 25], ['네이비', '#1B2A4A', 68, 140, 56.4, 2.2, 35, 48, 75, 20], ['베이지', '#D4C5A9', 68, 100, 54.1, 2.1, 25, 48, 78, 15]) },

  // ── FW25 니트류 ──
  { id: 'D-010', year: 2025, season: 'FW25', garmentType: '니트류', itemName: '터틀넥 울 니트', planner: '김지현', styleCode: 'SP25F-KNT-003',
    sellThroughTarget: 80, actualSalesQty: 1580, achievementRate: 95.2, weeklySellThrough: 6.8, weeklySalesVolume: 395, costRate: 50, adjustedSellingPeriod: 35, reorderQuantity: 0,
    colorBreakdown: colors(['블랙', '#111111', 80, 580, 102.1, 7.5, 145, 50, 30, 0], ['차콜', '#4A4A4A', 80, 450, 93.7, 6.8, 113, 50, 35, 0], ['크림', '#F5F0E1', 80, 320, 88.8, 6.0, 80, 50, 38, 0], ['버건디', '#722F37', 80, 230, 86.2, 5.8, 57, 50, 40, 0]) },

  { id: 'D-011', year: 2025, season: 'FW25', garmentType: '니트류', itemName: '케이블 니트 스웨터', planner: '김지현', styleCode: 'SP25F-KNT-004',
    sellThroughTarget: 75, actualSalesQty: 1200, achievementRate: 82.4, weeklySellThrough: 5.1, weeklySalesVolume: 300, costRate: 52, adjustedSellingPeriod: 42, reorderQuantity: 0,
    colorBreakdown: colors(['아이보리', '#FFFFF0', 75, 480, 89.6, 5.8, 120, 52, 38, 0], ['그레이', '#A0A0A0', 75, 410, 82.1, 5.0, 103, 52, 43, 0], ['네이비', '#1B2A4A', 75, 310, 75.4, 4.5, 77, 52, 46, 0]) },

  // ── FW25 아우터 ──
  { id: 'D-012', year: 2025, season: 'FW25', garmentType: '아우터', itemName: '헤비 패딩 롱코트', planner: '한도윤', styleCode: 'SP25F-OTR-002',
    sellThroughTarget: 65, actualSalesQty: 380, achievementRate: 42.1, weeklySellThrough: 1.8, weeklySalesVolume: 95, costRate: 55, adjustedSellingPeriod: 90, reorderQuantity: 0,
    colorBreakdown: colors(['블랙', '#111111', 65, 180, 48.6, 2.1, 45, 55, 82, 0], ['차콜', '#4A4A4A', 65, 120, 38.4, 1.6, 30, 55, 95, 0], ['베이지', '#D4C5A9', 65, 80, 35.2, 1.4, 20, 55, 98, 0]) },

  { id: 'D-013', year: 2025, season: 'FW25', garmentType: '아우터', itemName: '트렌치코트 클래식', planner: '한도윤', styleCode: 'SP25F-OTR-003',
    sellThroughTarget: 70, actualSalesQty: 650, achievementRate: 72.2, weeklySellThrough: 3.5, weeklySalesVolume: 163, costRate: 48, adjustedSellingPeriod: 58, reorderQuantity: 0,
    colorBreakdown: colors(['베이지', '#D4C5A9', 70, 310, 81.5, 4.2, 78, 48, 50, 0], ['블랙', '#111111', 70, 210, 67.7, 3.1, 53, 48, 62, 0], ['카키', '#8B7D6B', 70, 130, 62.4, 2.8, 32, 48, 68, 0]) },

  // ── SS25 저지 (전년 시즌) ──
  { id: 'D-014', year: 2025, season: 'SS25', garmentType: '저지', itemName: '베이직 라운드 반팔', planner: '박준영', styleCode: 'SP25S-JSY-005',
    sellThroughTarget: 82, actualSalesQty: 3200, achievementRate: 112.6, weeklySellThrough: 8.5, weeklySalesVolume: 800, costRate: 33, adjustedSellingPeriod: 14, reorderQuantity: 0,
    colorBreakdown: colors(['블랙', '#111111', 82, 980, 118.2, 9.2, 245, 33, 12, 0], ['화이트', '#FAFAFA', 82, 920, 115.4, 9.0, 230, 33, 13, 0], ['그레이', '#A0A0A0', 82, 750, 108.5, 8.0, 188, 33, 15, 0], ['네이비', '#1B2A4A', 82, 550, 98.3, 7.2, 137, 33, 18, 0]) },

  { id: 'D-015', year: 2025, season: 'SS25', garmentType: '우븐', itemName: '코튼 치노 쇼츠', planner: '최서윤', styleCode: 'SP25S-WVN-003',
    sellThroughTarget: 78, actualSalesQty: 1800, achievementRate: 96.7, weeklySellThrough: 7.0, weeklySalesVolume: 450, costRate: 36, adjustedSellingPeriod: 21, reorderQuantity: 0,
    colorBreakdown: colors(['카키', '#8B7D6B', 78, 620, 102.3, 7.8, 155, 36, 18, 0], ['베이지', '#D4C5A9', 78, 540, 97.1, 7.2, 135, 36, 20, 0], ['블랙', '#111111', 78, 380, 91.5, 6.5, 95, 36, 24, 0], ['올리브', '#6B7B3A', 78, 260, 85.7, 5.8, 65, 36, 28, 0]) },

  // ── 달성율 200%+ (리오더 확정) ──
  { id: 'D-016', year: 2026, season: 'SS26', garmentType: '저지', itemName: '쿨맥스 기능성 반팔티', planner: '박준영', styleCode: 'SP26S-JSY-003',
    sellThroughTarget: 80, actualSalesQty: 4800, achievementRate: 245.3, weeklySellThrough: 12.5, weeklySalesVolume: 1200, costRate: 32, adjustedSellingPeriod: 10, reorderQuantity: 800,
    colorBreakdown: colors(['블랙', '#111111', 80, 1650, 258.1, 13.8, 413, 32, 8, 280], ['화이트', '#FAFAFA', 80, 1520, 242.5, 12.9, 380, 32, 9, 270], ['그레이', '#A0A0A0', 80, 1630, 235.2, 10.8, 407, 32, 12, 250]) },

  { id: 'D-017', year: 2026, season: 'SS26', garmentType: '니트류', itemName: '아이스 코튼 반팔니트', planner: '김지현', styleCode: 'SP26S-KNT-003',
    sellThroughTarget: 75, actualSalesQty: 3100, achievementRate: 210.8, weeklySellThrough: 10.2, weeklySalesVolume: 775, costRate: 40, adjustedSellingPeriod: 14, reorderQuantity: 500,
    colorBreakdown: colors(['크림', '#F5F0E1', 75, 1150, 220.4, 11.0, 288, 40, 12, 190], ['네이비', '#1B2A4A', 75, 1050, 208.7, 10.5, 263, 40, 14, 170], ['베이지', '#D4C5A9', 75, 900, 203.2, 9.2, 224, 40, 16, 140]) },

  { id: 'D-018', year: 2025, season: 'FW25', garmentType: '우븐', itemName: '기모 체크 셔츠', planner: '이수민', styleCode: 'SP25F-WVN-004',
    sellThroughTarget: 72, actualSalesQty: 2850, achievementRate: 205.1, weeklySellThrough: 9.8, weeklySalesVolume: 713, costRate: 43, adjustedSellingPeriod: 16, reorderQuantity: 450,
    colorBreakdown: colors(['레드체크', '#C0392B', 72, 1050, 215.3, 10.5, 263, 43, 14, 170], ['블루체크', '#2980B9', 72, 980, 202.8, 9.8, 245, 43, 16, 150], ['그린체크', '#27AE60', 72, 820, 197.1, 9.0, 205, 43, 18, 130]) },
];

// ─── Summary Metrics (하드코딩) ──────────────────────────

export function getMockMetrics(): DashboardMetrics {
  return {
    totalPendingItems: 9,
    criticalItems: 2,
    lowItems: 4,
    thisWeekReorderQuantity: 1300,
    projectedReorderQuantity: 1495,
    totalReorderValue: 48_750_000,
  };
}
