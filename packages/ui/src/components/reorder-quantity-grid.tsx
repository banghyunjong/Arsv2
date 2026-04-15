import { useState, useCallback } from 'react';
import type { ReorderConfirmItem } from '../data/mock-dashboard';

interface Props {
  items: ReorderConfirmItem[];
  onRemove: (id: string) => void;
  highlightId?: string | null;
  viewportClass?: string;
}

const fmtQty = (v: number) => v.toLocaleString();
const fmtAmt = (v: number) => `₩${v.toLocaleString()}`;

export function ReorderQuantityGrid({ items, onRemove, highlightId, viewportClass }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <section>
      <div className={viewportClass || "grid-viewport"}>
        <table className="table grid-table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>스타일</th>
              <th style={{ width: 100 }} className="text-center">컬러</th>
              <th style={{ width: 80 }} className="table-num">수량</th>
              <th style={{ width: 120 }} className="table-num">발주액</th>
              <th style={{ width: 80 }} className="table-num">리오더 총량</th>
              <th style={{ width: 70 }} className="table-num">W+1</th>
              <th style={{ width: 70 }} className="table-num">W+2</th>
              <th style={{ width: 70 }} className="table-num">W+3</th>
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
              return (
                <ReorderRow
                  key={item.id}
                  item={item}
                  isExpanded={isExpanded}
                  isHighlighted={item.id === highlightId}
                  onToggle={toggleExpand}
                  onRemove={onRemove}
                />
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={13} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>
                  리오더 항목이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface ReorderRowProps {
  item: ReorderConfirmItem;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

function ReorderRow({ item, isExpanded, isHighlighted, onToggle, onRemove }: ReorderRowProps) {
  const hasColors = item.colors.length > 1;
  return (
    <>
      <tr style={{ height: 28 }} className={isHighlighted ? 'row-highlight-added' : ''}>
        <td>
          <code style={{ fontSize: 'var(--text-overline)' }}>{item.styleCode}</code>
          {item.styleName && <div style={{ fontSize: 'var(--text-overline)', opacity: 0.7 }}>{item.styleName}</div>}
        </td>
        <td className="text-center">
          {hasColors ? (
            <button
              className={`btn-toggle${isExpanded ? ' active' : ''}`}
              onClick={() => onToggle(item.id)}
            >
              {isExpanded ? '접기' : `${item.colors.length}컬러`}
            </button>
          ) : (
            item.colors[0] && (
              <span>
                {item.colors[0].colorName}
              </span>
            )
          )}
        </td>
        <td className="table-num"><strong>{fmtQty(item.quantity)}</strong></td>
        <td className="table-num">{fmtAmt(item.orderAmount)}</td>
        <td className="table-num">{fmtQty(item.totalReorderQty)}</td>
        <td className="table-num">{fmtQty(item.w1)}</td>
        <td className="table-num">{fmtQty(item.w2)}</td>
        <td className="table-num">{fmtQty(item.w3)}</td>
        <td>{item.factory}</td>
        <td className="text-center">{item.planner}</td>
        <td className="text-center">{item.sourcing}</td>
        <td className="text-center">{item.deliveryDate}</td>
        <td className="text-center">
          <button className="btn-toggle" onClick={() => onRemove(item.id)}>제거</button>
        </td>
      </tr>
      {isExpanded && item.colors.map((c) => (
        <tr key={c.colorName} className="color-breakdown-row-inline">
          <td />
          <td className="text-center">
            {c.colorName}
          </td>
          <td className="table-num">{fmtQty(c.quantity)}</td>
          <td className="table-num">{c.orderAmount ? fmtAmt(c.orderAmount) : ''}</td>
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
