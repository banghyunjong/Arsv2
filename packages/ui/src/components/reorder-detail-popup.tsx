import type { DetailGridItem } from '../data/mock-dashboard';
import { Modal } from './modal';

interface Props {
  item: DetailGridItem;
  periodWeeks: number;
  onClose: () => void;
}

const fmtQty = (v: number) => v.toLocaleString();

export function ReorderDetailPopup({ item, periodWeeks, onClose }: Props) {
  const weeklyVol = item.weeklySalesVolume;
  const thisWeek = weeklyVol;
  const totalWeeks = periodWeeks;
  const fourWeekQty = weeklyVol * totalWeeks;

  // 주차별 분배 (간단한 균등 배분)
  const weeks = Array.from({ length: totalWeeks }, (_, i) => ({
    label: `W+${i + 1}`,
    qty: i < totalWeeks - 1
      ? Math.ceil(fourWeekQty / totalWeeks)
      : fourWeekQty - Math.ceil(fourWeekQty / totalWeeks) * (totalWeeks - 1),
  }));

  return (
    <Modal title="리오더 수량 상세" onClose={onClose} width="560px">
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div className="modal-info-grid" style={{ marginBottom: 'var(--space-3)' }}>
          <span className="modal-info-label">스타일코드</span>
          <span className="modal-info-value"><code>{item.styleCode}</code></span>
          <span className="modal-info-label">아이템명</span>
          <span className="modal-info-value">{item.itemName}</span>
          <span className="modal-info-label">기획자</span>
          <span className="modal-info-value">{item.planner}</span>
        </div>

        <h4 style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-2)' }}>
          리오더 수량 산정 사유
        </h4>
        <div style={{
          padding: 'var(--space-3)',
          background: 'var(--glass-bg)',
          border: 'var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-gray-600)',
          lineHeight: 'var(--leading-relaxed)',
        }}>
          <p style={{ margin: 0 }}>
            주판량 <strong>{fmtQty(weeklyVol)}</strong>pcs 기준, 보정판매기간 <strong>{totalWeeks}주</strong> 적용
          </p>
          <p style={{ margin: 'var(--space-1) 0 0' }}>
            달성율 <strong>{item.achievementRate.toFixed(1)}%</strong> | 소진율목표 <strong>{item.sellThroughTarget.toFixed(1)}%</strong> | 원가율 <strong>{item.costRate.toFixed(1)}%</strong>
          </p>
          <p style={{ margin: 'var(--space-1) 0 0' }}>
            이번주 리오더: <strong>{fmtQty(thisWeek)}</strong>pcs | {totalWeeks}주 리오더: <strong>{fmtQty(fourWeekQty)}</strong>pcs
          </p>
        </div>
      </div>

      <h4 style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-2)' }}>
        주차별 리오더 수량
      </h4>
      <table className="modal-table">
        <thead>
          <tr>
            <th>주차</th>
            <th style={{ textAlign: 'right' }}>수량 (pcs)</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.label}>
              <td>{w.label}</td>
              <td className="table-num">{fmtQty(w.qty)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>합계</td>
            <td className="table-num">{fmtQty(fourWeekQty)}</td>
          </tr>
        </tfoot>
      </table>
    </Modal>
  );
}
