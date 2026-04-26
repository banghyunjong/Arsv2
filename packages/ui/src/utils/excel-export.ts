import type { DetailGridItem } from '../data/mock-dashboard';

interface ExportOptions {
  items: DetailGridItem[];
  fileName?: string;
}

const HEADERS = [
  '연도', '시즌', '복종', '아이템', '스타일코드', '기획자', '공장', '차수',
  '소진율목표(%)', '실적', '달성율(%)', '주판율(%)', '주판량', '원가율(%)',
  '이번주 리오더', '4주 리오더', '리오더 수량', '리오더 사유',
];

function getReorderReason(item: DetailGridItem): string {
  if (item.reorderQuantity <= 0) return '';
  if (item.achievementRate >= 200) return '달성율 200%+ 초과 판매';
  if (item.achievementRate >= 100) return '목표 달성, 추가 수요 예상';
  return '판매 추이 기반 리오더 권장';
}

function itemToRow(item: DetailGridItem): string[] {
  return [
    String(item.year),
    item.season,
    item.garmentType,
    item.itemName,
    item.styleCode,
    item.planner,
    item.factoryName,
    String(item.reorderRound),
    item.sellThroughTarget.toFixed(1),
    String(item.actualSalesQty),
    item.achievementRate.toFixed(1),
    item.weeklySellThrough.toFixed(1),
    String(item.weeklySalesVolume),
    item.costRate.toFixed(1),
    String(item.thisWeekReorderQty),
    String(item.fourWeekReorderQty),
    String(item.reorderQuantity),
    getReorderReason(item),
  ];
}

function toCsvContent(items: DetailGridItem[]): string {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel
  const header = HEADERS.join(',');
  const rows = items.map((item) =>
    itemToRow(item).map((v) => `"${v.replace(/"/g, '""')}"`).join(',')
  );
  return bom + [header, ...rows].join('\r\n');
}

export async function exportDetailToExcel({ items, fileName }: ExportOptions) {
  const today = new Date().toISOString().slice(0, 10);
  const name = fileName || `ARS_상세내역_${today}.xlsx`;

  try {
    // Dynamic import to avoid SSR issues
    const { default: writeXlsxFile } = await import('write-excel-file/browser');

    const headerRow = HEADERS.map((h) => ({ value: h, fontWeight: 'bold' as const }));
    const dataRows = items.map((item) => [
      { value: item.year },
      { value: item.season },
      { value: item.garmentType },
      { value: item.itemName },
      { value: item.styleCode },
      { value: item.planner },
      { value: item.factoryName },
      { value: item.reorderRound },
      { value: item.sellThroughTarget },
      { value: item.actualSalesQty },
      { value: item.achievementRate },
      { value: item.weeklySellThrough },
      { value: item.weeklySalesVolume },
      { value: item.costRate },
      { value: item.thisWeekReorderQty },
      { value: item.fourWeekReorderQty },
      { value: item.reorderQuantity },
      { value: getReorderReason(item) },
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (writeXlsxFile as any)([headerRow, ...dataRows], { fileName: name });
  } catch {
    // Fallback: CSV download
    const csv = toCsvContent(items);
    const csvName = name.replace('.xlsx', '.csv');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = csvName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
