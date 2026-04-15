interface Props {
  viewportClass?: string;
}

export function FactoryFabricGrid({ viewportClass }: Props) {
  return (
    <section>
      <div className="flex-between mb-2">
        <h2 className="section-title">공장 원단 현황</h2>
      </div>
      <div className={viewportClass || 'grid-viewport'}>
        <table className="table grid-table">
          <thead>
            <tr>
              <th style={{ width: 110 }}>공장</th>
              <th style={{ width: 100 }}>원단</th>
              <th style={{ width: 80 }} className="table-num">재고</th>
              <th style={{ width: 80 }} className="text-center">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>
                데이터 준비 중
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
