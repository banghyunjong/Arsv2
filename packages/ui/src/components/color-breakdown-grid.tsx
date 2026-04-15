import type { ColorBreakdownItem } from '../data/mock-dashboard';
import { PERF_SIZES, BASIC_TOTAL_WIDTH } from './detail-table-columns';

interface Props {
  items: ColorBreakdownItem[];
  trailingWidth?: number;
  parentId?: string;
  onToggleReorder?: (id: string) => void;
  reorderIds?: Set<string>;
}

const perfKeys: (keyof typeof PERF_SIZES)[] = [
  'sellThroughTarget', 'actualSalesQty', 'achievementRate',
  'weeklySellThrough', 'weeklySalesVolume', 'costRate',
  'adjustedSellingPeriod', 'reorderQuantity',
];

const fmtPct = (v: number) => `${v.toFixed(1)}%`;
const fmtQty = (v: number) => v.toLocaleString();
const fmtDays = (v: number) => `${v}일`;

function formatValue(key: string, value: number): React.ReactNode {
  switch (key) {
    case 'actualSalesQty':
    case 'weeklySalesVolume':
      return fmtQty(value);
    case 'adjustedSellingPeriod':
      return fmtDays(value);
    case 'reorderQuantity':
      return value > 0 ? <strong>{fmtQty(value)}</strong> : <span className="text-muted">—</span>;
    case 'achievementRate': {
      const cls = value >= 100 ? 'text-success' : value < 60 ? 'text-error' : '';
      return <span className={cls}>{fmtPct(value)}</span>;
    }
    default:
      return fmtPct(value);
  }
}

export function ColorBreakdownGrid({ items, trailingWidth = 70, parentId, onToggleReorder, reorderIds }: Props) {
  const showReorder = parentId && onToggleReorder && reorderIds;

  return (
    <div className="color-breakdown-wrapper">
      <table className="color-breakdown-table">
        <tbody>
          {items.map((item) => {
            const colorReorderId = parentId ? `${parentId}::${item.colorName}` : '';
            const isSelected = reorderIds?.has(colorReorderId) ?? false;
            return (
              <tr key={item.colorName}>
                <td style={{ width: BASIC_TOTAL_WIDTH, paddingLeft: 'var(--space-6)' }}>
                  <span className="color-swatch" style={{ backgroundColor: item.colorCode }} />
                  {item.colorName}
                </td>
                {perfKeys.map((key) => (
                  <td key={key} style={{ width: PERF_SIZES[key], textAlign: 'right' }}>
                    {formatValue(key, item[key])}
                  </td>
                ))}
                <td style={{ width: trailingWidth, textAlign: 'center' }}>
                  {showReorder && (
                    <button
                      className={`btn-reorder-select${isSelected ? ' selected' : ''}`}
                      onClick={() => onToggleReorder(colorReorderId)}
                    >
                      {isSelected ? '선택됨' : '선택'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
