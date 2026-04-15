import type { ReorderConfirmItem } from '../data/mock-dashboard';

interface Props {
  reorderItems: ReorderConfirmItem[];
}

const fmtAmt = (v: number) => {
  if (v >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`;
  if (v >= 10_000) return `${Math.round(v / 10_000).toLocaleString()}만`;
  return v.toLocaleString();
};

export function ReorderSummaryCards({ reorderItems }: Props) {
  const styleCount = reorderItems.length;
  const totalQty = reorderItems.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = reorderItems.reduce((s, i) => s + i.orderAmount, 0);

  // Mock cost rate: 38~46% range
  const avgCostRate = styleCount > 0 ? 42.3 : 0;

  // Production portfolio from factory data
  const factoryMap = new Map<string, number>();
  for (const item of reorderItems) {
    const country = item.factory.split(' ')[0];
    factoryMap.set(country, (factoryMap.get(country) ?? 0) + item.quantity);
  }
  const portfolio = [...factoryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([country, qty]) => ({
      country,
      pct: totalQty > 0 ? Math.round((qty / totalQty) * 100) : 0,
    }));

  return (
    <section>
      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-card-label">리오더 스타일 수</span>
          <span className="summary-card-value">
            {styleCount}
            <span className="summary-card-unit">건</span>
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-card-label">리오더 발주액</span>
          <span className="summary-card-value">
            {fmtAmt(totalAmount)}
            <span className="summary-card-unit">원</span>
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-card-label">리오더 발주량</span>
          <span className="summary-card-value">
            {totalQty.toLocaleString()}
            <span className="summary-card-unit">pcs</span>
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-card-label">리오더 원가율</span>
          <span className="summary-card-value">
            {avgCostRate.toFixed(1)}
            <span className="summary-card-unit">%</span>
          </span>
        </div>

        <div className="summary-card" style={{ flex: '1.5 1 200px', minWidth: 200 }}>
          <span className="summary-card-label">생산지 포트폴리오</span>
          {portfolio.length > 0 ? (
            <>
              <div className="portfolio-bar">
                {portfolio.map((p) => (
                  <div key={p.country} className="portfolio-segment" style={{ flex: p.pct }} title={`${p.country} ${p.pct}%`} />
                ))}
              </div>
              <div className="portfolio-legend">
                {portfolio.map((p) => (
                  <span key={p.country} className="portfolio-legend-item">
                    <span className="portfolio-dot" />
                    {p.country} {p.pct}%
                  </span>
                ))}
              </div>
            </>
          ) : (
            <span className="text-muted" style={{ fontSize: 'var(--text-caption)' }}>선택된 리오더 없음</span>
          )}
        </div>
      </div>
    </section>
  );
}
