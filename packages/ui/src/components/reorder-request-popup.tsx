import { useState, useMemo } from 'react';
import type { DetailGridItem } from '../data/mock-dashboard';
import { Modal } from './modal';

interface Props {
  item: DetailGridItem;
  onConfirm: (id: string, selectedColors: string[], quantities: Record<string, number>) => void;
  onCancel: () => void;
}

const MOCK_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const MOCK_UNIT_PRICE = [12500, 15000, 18000, 22000, 9800, 14500, 16000, 20000];

function pickMock<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

const fmtQty = (v: number) => v.toLocaleString();
const fmtAmtMillion = (v: number) => {
  const m = v / 1_000_000;
  if (m >= 1) return `${m.toFixed(1)}백만`;
  const man = Math.round(v / 10_000);
  return man > 0 ? `${man.toLocaleString()}만` : v.toLocaleString();
};

export function ReorderRequestPopup({ item, onConfirm, onCancel }: Props) {
  const unitPrice = pickMock(MOCK_UNIT_PRICE, item.styleCode.length + item.year);

  const [checkedColors, setCheckedColors] = useState<Set<string>>(() => new Set(
    item.colorBreakdown.filter((c) => c.reorderQuantity > 0).map((c) => c.colorName)
  ));

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const q: Record<string, number> = {};
    for (const c of item.colorBreakdown) {
      q[c.colorName] = c.reorderQuantity;
    }
    return q;
  });

  const toggleColor = (name: string) => {
    setCheckedColors((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const updateQty = (colorName: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [colorName]: Math.max(0, value) }));
  };

  const totalQty = useMemo(() => {
    return item.colorBreakdown
      .filter((c) => checkedColors.has(c.colorName))
      .reduce((sum, c) => sum + (quantities[c.colorName] ?? 0), 0);
  }, [checkedColors, quantities, item.colorBreakdown]);

  const totalAmount = totalQty * unitPrice;

  const handleConfirm = () => {
    const selectedColors = [...checkedColors];
    onConfirm(item.id, selectedColors, quantities);
  };

  return (
    <Modal
      title={`리오더 요청 — ${item.styleCode}`}
      onClose={onCancel}
      width="700px"
      footer={
        <>
          <div style={{
            flex: 1,
            fontSize: 'var(--text-caption)',
            color: 'var(--color-gray-400)',
            lineHeight: 'var(--leading-relaxed)',
          }}>
            리오더 요청 내역은 리오더 확정탭에서 보실 수 있으며<br />
            확정 탭에서 최종 확정하셔야 공장에 요청됩니다.
          </div>
          <button className="btn-modal-cancel" onClick={onCancel}>취소</button>
          <button
            className="btn-modal-confirm"
            onClick={handleConfirm}
            disabled={checkedColors.size === 0}
          >
            요청
          </button>
        </>
      }
    >
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div className="modal-info-grid">
          <span className="modal-info-label">아이템</span>
          <span className="modal-info-value">{item.itemName}</span>
          <span className="modal-info-label">기획자</span>
          <span className="modal-info-value">{item.planner}</span>
          <span className="modal-info-label">합계 수량</span>
          <span className="modal-info-value"><strong>{fmtQty(totalQty)}</strong> pcs</span>
          <span className="modal-info-label">발주액</span>
          <span className="modal-info-value"><strong>{fmtAmtMillion(totalAmount)}</strong></span>
        </div>
      </div>

      <table className="modal-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>선택</th>
            <th>컬러</th>
            {MOCK_SIZES.map((s) => (
              <th key={s} style={{ textAlign: 'right', width: 55 }}>{s}</th>
            ))}
            <th style={{ textAlign: 'right', width: 80 }}>수정 수량</th>
            <th style={{ textAlign: 'right', width: 90 }}>발주액</th>
          </tr>
        </thead>
        <tbody>
          {item.colorBreakdown.map((c) => {
            const isChecked = checkedColors.has(c.colorName);
            const qty = quantities[c.colorName] ?? 0;
            const colorAmount = qty * unitPrice;

            // Mock size distribution
            const sizeDistribution = MOCK_SIZES.map((_, i) => {
              const ratio = [0.1, 0.25, 0.3, 0.25, 0.1][i];
              return Math.round(qty * ratio);
            });

            return (
              <tr key={c.colorName} style={{ opacity: isChecked ? 1 : 0.4 }}>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColor(c.colorName)}
                  />
                </td>
                <td>{c.colorName}</td>
                {sizeDistribution.map((sq, i) => (
                  <td key={MOCK_SIZES[i]} className="table-num" style={{ fontSize: 'var(--text-overline)' }}>
                    {isChecked ? fmtQty(sq) : '—'}
                  </td>
                ))}
                <td className="table-num">
                  {isChecked ? (
                    <input
                      type="number"
                      className="period-select"
                      style={{ width: 65, textAlign: 'right' }}
                      value={qty}
                      min={0}
                      onChange={(e) => updateQty(c.colorName, Number(e.target.value))}
                    />
                  ) : '—'}
                </td>
                <td className="table-num">
                  {isChecked ? fmtAmtMillion(colorAmount) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>합계</td>
            {MOCK_SIZES.map((s) => <td key={s} />)}
            <td className="table-num"><strong>{fmtQty(totalQty)}</strong></td>
            <td className="table-num"><strong>{fmtAmtMillion(totalAmount)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </Modal>
  );
}
