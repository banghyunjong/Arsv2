import type { DetailGridItem } from '../data/mock-dashboard';
import { Modal } from './modal';

interface Props {
  item: DetailGridItem;
  onClose: () => void;
}

const fmtQty = (v: number) => v.toLocaleString();

const MOCK_STORES = [
  '강남점', '명동점', '잠실점', '홍대점', '신촌점',
  '부산서면점', '대구동성로점', '광주충장로점',
];

interface StoreRow {
  storeName: string;
  distributionQty: number;
  currentStock: number;
  avg2WeekSales: number;
  w1: number;
  w2: number;
  w3: number;
  w4: number;
}

function buildStoreRows(item: DetailGridItem): StoreRow[] {
  const totalQty = item.weeklySalesVolume * 4;
  const storeCount = MOCK_STORES.length;

  return MOCK_STORES.map((name, i) => {
    const weight = 1 + (storeCount - i) * 0.12;
    const baseQty = Math.round((totalQty / storeCount) * weight);
    const avg2Week = Math.round(baseQty * 0.25);
    const w1 = Math.ceil(baseQty * 0.35);
    const w2 = Math.ceil(baseQty * 0.25);
    const w3 = Math.ceil(baseQty * 0.22);
    const w4 = Math.max(0, baseQty - w1 - w2 - w3);

    return {
      storeName: name,
      distributionQty: baseQty,
      currentStock: Math.round(baseQty * 0.3 + (i * 7)),
      avg2WeekSales: avg2Week,
      w1, w2, w3, w4,
    };
  });
}

export function StoreDistributionPopup({ item, onClose }: Props) {
  const rows = buildStoreRows(item);

  const totals = rows.reduce(
    (acc, r) => ({
      distributionQty: acc.distributionQty + r.distributionQty,
      currentStock: acc.currentStock + r.currentStock,
      avg2WeekSales: acc.avg2WeekSales + r.avg2WeekSales,
      w1: acc.w1 + r.w1,
      w2: acc.w2 + r.w2,
      w3: acc.w3 + r.w3,
      w4: acc.w4 + r.w4,
    }),
    { distributionQty: 0, currentStock: 0, avg2WeekSales: 0, w1: 0, w2: 0, w3: 0, w4: 0 },
  );

  return (
    <Modal title={`매장분배현황 — ${item.styleCode}`} onClose={onClose} width="780px">
      <div className="modal-info-grid" style={{ marginBottom: 'var(--space-3)' }}>
        <span className="modal-info-label">아이템</span>
        <span className="modal-info-value">{item.itemName}</span>
        <span className="modal-info-label">기획자</span>
        <span className="modal-info-value">{item.planner}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="modal-table">
          <thead>
            <tr>
              <th>매장명</th>
              <th style={{ textAlign: 'right' }}>분배 예정</th>
              <th style={{ textAlign: 'right' }}>현 매장재고</th>
              <th style={{ textAlign: 'right' }}>2주 평균판매</th>
              <th style={{ textAlign: 'right' }}>W+1</th>
              <th style={{ textAlign: 'right' }}>W+2</th>
              <th style={{ textAlign: 'right' }}>W+3</th>
              <th style={{ textAlign: 'right' }}>W+4</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.storeName}>
                <td>{r.storeName}</td>
                <td className="table-num">{fmtQty(r.distributionQty)}</td>
                <td className="table-num">{fmtQty(r.currentStock)}</td>
                <td className="table-num">{fmtQty(r.avg2WeekSales)}</td>
                <td className="table-num">{fmtQty(r.w1)}</td>
                <td className="table-num">{fmtQty(r.w2)}</td>
                <td className="table-num">{fmtQty(r.w3)}</td>
                <td className="table-num">{fmtQty(r.w4)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>합계</td>
              <td className="table-num">{fmtQty(totals.distributionQty)}</td>
              <td className="table-num">{fmtQty(totals.currentStock)}</td>
              <td className="table-num">{fmtQty(totals.avg2WeekSales)}</td>
              <td className="table-num">{fmtQty(totals.w1)}</td>
              <td className="table-num">{fmtQty(totals.w2)}</td>
              <td className="table-num">{fmtQty(totals.w3)}</td>
              <td className="table-num">{fmtQty(totals.w4)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Modal>
  );
}
