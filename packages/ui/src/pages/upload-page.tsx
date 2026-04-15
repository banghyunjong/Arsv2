import { useRef, useState } from 'react';
import type { ApiResponse, CsvUploadResult } from '@arsv2/types';

export function UploadPage() {
  const [uploadResult, setUploadResult] = useState<CsvUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const productInputRef = useRef<HTMLInputElement>(null);
  const inventoryInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: 'products' | 'inventory') => {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/upload/${type}`, { method: 'POST', body: formData });
      const json: ApiResponse<CsvUploadResult> = await res.json();
      if (json.success && json.data) {
        setUploadResult(json.data);
      } else {
        setError(json.error?.message || 'Upload failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="container page">
      <p className="text-muted">상품 및 재고 CSV 파일을 업로드하여 데이터를 등록하세요.</p>

      <div className="flex gap-4 mt-6" style={{ flexWrap: 'wrap' }}>
        <section className="card" style={{ flex: '1 1 300px' }}>
          <div className="card-header">
            <h3 className="card-title">상품 CSV</h3>
          </div>
          <input
            ref={productInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file, 'products');
            }}
            hidden
          />
          <div
            className="upload-zone"
            onClick={() => productInputRef.current?.click()}
          >
            <span className="upload-zone-label">클릭하여 상품 CSV 파일 선택</span>
            <span className="upload-zone-hint">.csv 파일만 지원 (최대 10MB)</span>
          </div>
        </section>

        <section className="card" style={{ flex: '1 1 300px' }}>
          <div className="card-header">
            <h3 className="card-title">재고 CSV</h3>
          </div>
          <input
            ref={inventoryInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file, 'inventory');
            }}
            hidden
          />
          <div
            className="upload-zone"
            onClick={() => inventoryInputRef.current?.click()}
          >
            <span className="upload-zone-label">클릭하여 재고 CSV 파일 선택</span>
            <span className="upload-zone-hint">.csv 파일만 지원 (최대 10MB)</span>
          </div>
        </section>
      </div>

      {uploading && <p className="text-muted mt-4">업로드 중...</p>}

      {error && (
        <div className="card mt-6" style={{ borderColor: 'var(--color-error)' }}>
          <p className="text-error">오류: {error}</p>
        </div>
      )}

      {uploadResult && (
        <section className="card mt-6">
          <div className="card-header">
            <h3 className="card-title">업로드 결과</h3>
            <span className={`badge ${uploadResult.errorRows > 0 ? 'badge-warning' : 'badge-success'}`}>
              {uploadResult.errorRows > 0 ? '일부 오류' : '성공'}
            </span>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>항목</th>
                <th>값</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>파일명</td><td>{uploadResult.fileName}</td></tr>
              <tr><td>전체 행</td><td>{uploadResult.totalRows.toLocaleString()}</td></tr>
              <tr><td>성공</td><td className="text-success">{uploadResult.successRows.toLocaleString()}</td></tr>
              <tr>
                <td>오류</td>
                <td className={uploadResult.errorRows > 0 ? 'text-error' : ''}>
                  {uploadResult.errorRows.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {uploadResult.errors.length > 0 && (
            <details className="mt-4">
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-body-sm)' }}>
                오류 상세 ({uploadResult.errors.length}건)
              </summary>
              <table className="table mt-2">
                <thead>
                  <tr>
                    <th>행</th>
                    <th>필드</th>
                    <th>메시지</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResult.errors.map((err, i) => (
                    <tr key={i}>
                      <td>{err.row}</td>
                      <td><code>{err.field}</code></td>
                      <td>{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </section>
      )}
    </main>
  );
}
