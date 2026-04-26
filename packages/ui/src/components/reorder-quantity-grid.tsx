import { useState, useCallback } from 'react';
import type { ReorderConfirmItem } from '../data/mock-dashboard';
import { ConfirmModal } from './modal';

interface Props {
  items: ReorderConfirmItem[];
  onRemove: (id: string) => void;
  highlightId?: string | null;
  viewportClass?: string;
  checkedIds: Set<string>;
  confirmedIds: Set<string>;
  onToggleCheck: (id: string) => void;
  onConfirm: () => void;
  onCancelRequest: () => void;
  onFactoryChange?: (id: string, factory: string) => void;
}

const FACTORY_OPTIONS = ['닝보(홍화)', '닝보(아이비)', '탕콤', '미지정'];

const fmtQty = (v: number) => v.toLocaleString();
const fmtAmtMillion = (v: number) => {
  const m = v / 1_000_000;
  if (m >= 1) return `${m.toFixed(1)}백만`;
  const man = Math.round(v / 10_000);
  return man > 0 ? `${man.toLocaleString()}만` : v.toLocaleString();
};

export function ReorderQuantityGrid({
  items, onRemove, highlightId, viewportClass,
  checkedIds, confirmedIds, onToggleCheck, onConfirm, onCancelRequest, onFactoryChange,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [warningItem, setWarningItem] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleRowClick = useCallback((id: string) => {
    if (confirmedIds.has(id)) {
      setWarningItem(id);
    }
  }, [confirmedIds]);

  const hasChecked = [...checkedIds].some((id) => !confirmedIds.has(id));
  const hasUncheckedUnconfirmed = items.some((i) => !confirmedIds.has(i.id) && checkedIds.has(i.id));

  return (
    <section>
      <div className="flex-between mb-2">
        <h2 className="section-title">리오더 확정</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            className="btn-toggle"
            onClick={onCancelRequest}
            disabled={!hasUncheckedUnconfirmed}
            title="선택한 미확정 항목의 리오더 요청을 취소합니다"
          >
            리오더 요청 취소
          </button>
          <button
            className="btn-fetch"
            onClick={onConfirm}
            disabled={!hasChecked}
          >
            최종확정
          </button>
        </div>
      </div>

      <div className={viewportClass || "grid-viewport"}>
        <table className="table grid-table">
          <thead>
            <tr>
              <th style={{ width: 40 }} className="text-center">선택</th>
              <th style={{ width: 50 }} className="text-center">차수</th>
              <th style={{ width: 130 }}>스타일</th>
              <th style={{ width: 100 }} className="text-center">컬러</th>
              <th style={{ width: 80 }} className="table-num"><strong>수량</strong></th>
              <th style={{ width: 100 }} className="table-num"><strong>발주액</strong></th>
              <th style={{ width: 80 }} className="table-num">리오더 총량</th>
              <th style={{ width: 60 }} className="table-num">W+1</th>
              <th style={{ width: 60 }} className="table-num">W+2</th>
              <th style={{ width: 60 }} className="table-num">W+3</th>
              <th style={{ width: 110 }}>공장</th>
              <th style={{ width: 70 }} className="text-center">기획</th>
              <th style={{ width: 70 }} className="text-center">소싱</th>
              <th style={{ width: 100 }} className="text-center">납기</th>
              <th style={{ width: 50 }} className="text-center">삭제</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isExpanded = expandedIds.has(item.id);
              const isConfirmed = confirmedIds.has(item.id);
              return (
                <ReorderRow
                  key={item.id}
                  item={item}
                  isExpanded={isExpanded}
                  isHighlighted={item.id === highlightId}
                  isChecked={checkedIds.has(item.id)}
                  isConfirmed={isConfirmed}
                  onToggle={toggleExpand}
                  onRemove={onRemove}
                  onCheck={onToggleCheck}
                  onRowClick={handleRowClick}
                  onFactoryChange={onFactoryChange}
                />
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={15} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>
                  리오더 항목이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {warningItem && (
        <ConfirmModal
          title="수정 불가"
          message="이미 공장에 요청된 내역이므로 수정 필요 시 공장에 문의하세요."
          variant="warning"
          confirmLabel="확인"
          cancelLabel="닫기"
          onConfirm={() => setWarningItem(null)}
          onCancel={() => setWarningItem(null)}
        />
      )}
    </section>
  );
}

interface ReorderRowProps {
  item: ReorderConfirmItem;
  isExpanded: boolean;
  isHighlighted: boolean;
  isChecked: boolean;
  isConfirmed: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onCheck: (id: string) => void;
  onRowClick: (id: string) => void;
  onFactoryChange?: (id: string, factory: string) => void;
}

function ReorderRow({
  item, isExpanded, isHighlighted, isChecked, isConfirmed,
  onToggle, onRemove, onCheck, onRowClick, onFactoryChange,
}: ReorderRowProps) {
  const hasColors = item.colors.length > 1;
  const rowClass = [
    isHighlighted ? 'row-highlight-added' : '',
    isConfirmed ? 'row-confirmed' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <tr
        style={{ height: 28 }}
        className={rowClass}
        onClick={() => onRowClick(item.id)}
      >
        <td className="text-center">
          <input
            type="checkbox"
            checked={isChecked}
            disabled={isConfirmed}
            onChange={() => onCheck(item.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
        <td className="text-center">
          {item.reorderRound != null && item.reorderRound > 0 ? `${item.reorderRound}차` : '—'}
        </td>
        <td>
          <code style={{ fontSize: 'var(--text-overline)' }}>{item.styleCode}</code>
          {item.styleName && <div style={{ fontSize: 'var(--text-overline)', opacity: 0.7 }}>{item.styleName}</div>}
        </td>
        <td className="text-center">
          {hasColors ? (
            <button
              className={`btn-toggle${isExpanded ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
            >
              {isExpanded ? '접기' : `${item.colors.length}컬러`}
            </button>
          ) : (
            item.colors[0] && <span>{item.colors[0].colorName}</span>
          )}
        </td>
        <td className="table-num"><strong>{fmtQty(item.quantity)}</strong></td>
        <td className="table-num"><strong>{fmtAmtMillion(item.orderAmount)}</strong></td>
        <td className="table-num">{fmtQty(item.totalReorderQty)}</td>
        <td className="table-num">{fmtQty(item.w1)}</td>
        <td className="table-num">{fmtQty(item.w2)}</td>
        <td className="table-num">{fmtQty(item.w3)}</td>
        <td>
          {isConfirmed ? (
            item.factory
          ) : (
            <select
              className="period-select"
              value={item.factory}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onFactoryChange?.(item.id, e.target.value)}
            >
              {FACTORY_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
              {!FACTORY_OPTIONS.includes(item.factory) && (
                <option value={item.factory}>{item.factory}</option>
              )}
            </select>
          )}
        </td>
        <td className="text-center">{item.planner}</td>
        <td className="text-center">{item.sourcing}</td>
        <td className="text-center">{item.deliveryDate}</td>
        <td className="text-center">
          {!isConfirmed && (
            <button className="btn-toggle" onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}>제거</button>
          )}
        </td>
      </tr>
      {isExpanded && item.colors.map((c) => (
        <tr key={c.colorName} className={`color-breakdown-row-inline${isConfirmed ? ' row-confirmed' : ''}`}>
          <td />
          <td />
          <td />
          <td className="text-center">{c.colorName}</td>
          <td className="table-num">{fmtQty(c.quantity)}</td>
          <td className="table-num">{c.orderAmount ? fmtAmtMillion(c.orderAmount) : ''}</td>
          <td className="table-num">{c.totalReorderQty != null ? fmtQty(c.totalReorderQty) : ''}</td>
          <td className="table-num">{c.w1 != null ? fmtQty(c.w1) : ''}</td>
          <td className="table-num">{c.w2 != null ? fmtQty(c.w2) : ''}</td>
          <td className="table-num">{c.w3 != null ? fmtQty(c.w3) : ''}</td>
          <td />
          <td />
          <td />
          <td className="text-center" style={{ fontSize: 'var(--text-overline)' }}>{c.deliveryDate ?? ''}</td>
          <td />
        </tr>
      ))}
    </>
  );
}
