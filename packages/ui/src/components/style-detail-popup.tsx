import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DetailGridItem } from '../data/mock-dashboard';
import { Modal } from './modal';

interface Props {
  item: DetailGridItem;
  onClose: () => void;
}

const fmtQty = (v: number) => v.toLocaleString();
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

// Mock 가격/판매 정보
function getMockPriceInfo(item: DetailGridItem) {
  const unitPrice = 15000 + (item.styleCode.charCodeAt(item.styleCode.length - 1) % 10) * 3000;
  const avgSellingPrice = Math.round(unitPrice * (1 - item.costRate / 100) * 0.85);
  return {
    regularPrice: unitPrice,
    avgSellingPrice,
    avgDiscountRate: Math.round((1 - avgSellingPrice / unitPrice) * 100),
    regularSellRate: Math.round(item.sellThroughTarget * 0.9 * 10) / 10,
    salesPeriod: item.season.startsWith('SS') ? '3월~8월' : '9월~2월',
    expectedPeakPeriod: item.season.startsWith('SS') ? '5월~6월' : '11월~12월',
    totalSalesQty: item.actualSalesQty,
  };
}

// 판매 추이 차트 데이터 생성
function buildChartData(item: DetailGridItem) {
  const totalWeeks = 16;
  const currentWeek = 10;
  const weeklyPeak = item.weeklySalesVolume * 1.3;

  return Array.from({ length: totalWeeks }, (_, i) => {
    const week = i + 1;
    // PLC 기준선 (정규분포 형태)
    const plcPeak = weeklyPeak * 0.8;
    const plcCenter = totalWeeks * 0.45;
    const plcSigma = totalWeeks * 0.25;
    const plcValue = Math.round(plcPeak * Math.exp(-0.5 * ((week - plcCenter) / plcSigma) ** 2));

    if (week <= currentWeek) {
      // 실제 판매량 (약간의 변동)
      const noise = 1 + (Math.sin(week * 2.7) * 0.15);
      const actual = Math.round(item.weeklySalesVolume * noise * (0.6 + 0.4 * Math.sin(Math.PI * week / totalWeeks)));
      return { week: `W${week}`, actual, predicted: null, plc: plcValue };
    } else {
      // 예측 판매량
      const decay = Math.max(0.3, 1 - (week - currentWeek) * 0.08);
      const predicted = Math.round(item.weeklySalesVolume * decay * (0.6 + 0.4 * Math.sin(Math.PI * week / totalWeeks)));
      return { week: `W${week}`, actual: null, predicted, plc: plcValue };
    }
  });
}

export function StyleDetailPopup({ item, onClose }: Props) {
  const priceInfo = useMemo(() => getMockPriceInfo(item), [item]);
  const chartData = useMemo(() => buildChartData(item), [item]);

  return (
    <Modal title={`${item.styleCode} — ${item.itemName}`} onClose={onClose} width="680px">
      {/* 이미지 placeholder */}
      <div style={{
        width: '100%',
        height: 120,
        background: 'var(--glass-bg)',
        border: 'var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-4)',
        color: 'var(--color-gray-400)',
        fontSize: 'var(--text-caption)',
      }}>
        스타일 이미지 영역
      </div>

      {/* 가격 정보 + 판매 정보 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div>
          <h4 style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-2)', marginTop: 0 }}>
            가격 정보
          </h4>
          <div className="modal-info-grid">
            <span className="modal-info-label">정가</span>
            <span className="modal-info-value">₩{fmtQty(priceInfo.regularPrice)}</span>
            <span className="modal-info-label">평균판매가</span>
            <span className="modal-info-value">₩{fmtQty(priceInfo.avgSellingPrice)}</span>
            <span className="modal-info-label">평균할인율</span>
            <span className="modal-info-value">{priceInfo.avgDiscountRate}%</span>
            <span className="modal-info-label">정판율</span>
            <span className="modal-info-value">{fmtPct(priceInfo.regularSellRate)}</span>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-2)', marginTop: 0 }}>
            판매 정보
          </h4>
          <div className="modal-info-grid">
            <span className="modal-info-label">판매시기</span>
            <span className="modal-info-value">{priceInfo.salesPeriod}</span>
            <span className="modal-info-label">예상피크</span>
            <span className="modal-info-value">{priceInfo.expectedPeakPeriod}</span>
            <span className="modal-info-label">기판매량</span>
            <span className="modal-info-value">{fmtQty(priceInfo.totalSalesQty)}pcs</span>
            <span className="modal-info-label">달성율</span>
            <span className="modal-info-value">{fmtPct(item.achievementRate)}</span>
          </div>
        </div>
      </div>

      {/* 판매 추이 그래프 */}
      <h4 style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-2)' }}>
        판매 추이
      </h4>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0c1424',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 12,
                color: '#e2e8f0',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Line
              type="monotone"
              dataKey="actual"
              name="실제 판매량"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="예측 판매량"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ r: 2 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="plc"
              name="기준 PLC"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Modal>
  );
}
