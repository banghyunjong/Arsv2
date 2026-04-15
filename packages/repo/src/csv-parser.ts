import type { CsvUploadResult, CsvRowError } from '@arsv2/types';

export class CsvParser {
  parse<T>(
    content: string,
    validator: (row: Record<string, string>, index: number) => T | CsvRowError,
  ): CsvUploadResult & { records: T[] } {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      return {
        fileName: '',
        totalRows: 0,
        successRows: 0,
        errorRows: 0,
        errors: [],
        uploadedAt: new Date().toISOString(),
        records: [],
      };
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const records: T[] = [];
    const errors: CsvRowError[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      const result = validator(row, i);
      if (isRowError(result)) {
        errors.push(result);
      } else {
        records.push(result);
      }
    }

    return {
      fileName: '',
      totalRows: lines.length - 1,
      successRows: records.length,
      errorRows: errors.length,
      errors,
      uploadedAt: new Date().toISOString(),
      records,
    };
  }
}

function isRowError(value: unknown): value is CsvRowError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'row' in value &&
    'field' in value &&
    'message' in value
  );
}
