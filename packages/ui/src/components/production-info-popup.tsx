import type { DetailGridItem } from '../data/mock-dashboard';
import { Modal } from './modal';

interface Props {
  item: DetailGridItem;
  onClose: () => void;
}

const fmtQty = (v: number) => v.toLocaleString();

// 담당자 매핑 (피드백 반영)
const MANAGER_MAP: Record<string, string> = {
  '닝보(홍화)': '안재정',
  '닝보(아이비)': '안재정',
  '탕콤': '천경진',
};

function getManager(factory: string): string {
  return MANAGER_MAP[factory] ?? '미지정';
}

interface ProductionRow {
  colorName: string;
  factory: string;
  manager: string;
  processType: string;
  fabric: string;
  linkedStyle: string;
  currentStock: number;
  reservedQty: number;
  residualQty: number;
  expectedDemand: number;
  shortageQty: number;
  leadTime: string;
  status: string;
}

function buildProductionRows(item: DetailGridItem): ProductionRow[] {
  const factory = item.factoryName || '미지정';
  return item.colorBreakdown.map((c) => {
    const currentStock = Math.round(c.actualSalesQty * 0.3);
    const reservedQty = Math.round(c.actualSalesQty * 0.15);
    const residualQty = currentStock - reservedQty;
    const expectedDemand = c.weeklySalesVolume * 4;
    const shortageQty = Math.max(0, expectedDemand - residualQty);

    return {
      colorName: c.colorName,
      factory: c.supplierName || factory,
      manager: getManager(c.supplierName || factory),
      processType: Math.random() > 0.5 ? '임가공' : '완사입',
      fabric: `원단-${item.styleCode.slice(-3)}`,
      linkedStyle: '—',
      currentStock,
      reservedQty,
      residualQty,
      expectedDemand,
      shortageQty,
      leadTime: `${Math.round(14 + Math.random() * 14)}일`,
      status: shortageQty > 0 ? '부족' : '정상',
    };
  });
}

export function ProductionInfoPopup({ item, onClose }: Props) {
  const rows = buildProductionRows(item);

  const totals = rows.reduce(
    (acc, r) => ({
      currentStock: acc.currentStock + r.currentStock,
      reservedQty: acc.reservedQty + r.reservedQty,
      residualQty: acc.residualQty + r.residualQty,
      expectedDemand: acc.expectedDemand + r.expectedDemand,
      shortageQty: acc.shortageQty + r.shortageQty,
    }),
    { currentStock: 0, reservedQty: 0, residualQty: 0, expectedDemand: 0, shortageQty: 0 },
  );

  return (
    <Modal title={`생산정보 — ${item.styleCode}`} onClose={onClose} width="900px">
      <div style={{ overflowX: 'auto' }}>
        <table className="modal-table">
          <thead>
            <tr>
              <th>컬러</th>
              <th>생산공장</th>
              <th>생산담당자</th>
              <th>임가공/완사입</th>
              <th>원단</th>
              <th>연결 스타일</th>
              <th style={{ textAlign: 'right' }}>현재고</th>
              <th style={{ textAlign: 'right' }}>예약수량</th>
              <th style={{ textAlign: 'right' }}>잔존수량</th>
              <th style={{ textAlign: 'right' }}>예상수요</th>
              <th style={{ textAlign: 'right' }}>부족수량</th>
              <th>리드타임</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.colorName}>
                <td>{r.colorName}</td>
                <td>{r.factory}</td>
                <td>{r.manager}</td>
                <td>{r.processType}</td>
                <td>{r.fabric}</td>
                <td>{r.linkedStyle}</td>
                <td className="table-num">{fmtQty(r.currentStock)}</td>
                <td className="table-num">{fmtQty(r.reservedQty)}</td>
                <td className="table-num">{fmtQty(r.residualQty)}</td>
                <td className="table-num">{fmtQty(r.expectedDemand)}</td>
                <td className="table-num" style={{ color: r.shortageQty > 0 ? 'var(--color-error)' : undefined }}>
                  {r.shortageQty > 0 ? fmtQty(r.shortageQty) : '—'}
                </td>
                <td>{r.leadTime}</td>
                <td>
                  <span style={{
                    color: r.status === '부족' ? 'var(--color-error)' : 'var(--color-success)',
                    fontWeight: 'var(--font-weight-medium)' as unknown as number,
                  }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>합계</td>
              <td colSpan={5} />
              <td className="table-num">{fmtQty(totals.currentStock)}</td>
              <td className="table-num">{fmtQty(totals.reservedQty)}</td>
              <td className="table-num">{fmtQty(totals.residualQty)}</td>
              <td className="table-num">{fmtQty(totals.expectedDemand)}</td>
              <td className="table-num" style={{ color: totals.shortageQty > 0 ? 'var(--color-error)' : undefined }}>
                {totals.shortageQty > 0 ? fmtQty(totals.shortageQty) : '—'}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </Modal>
  );
}
