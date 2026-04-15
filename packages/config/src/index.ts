/**
 * @arsv2/config — Layer 1
 * Application configuration. Depends only on @arsv2/types.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Walk up from cwd to find .env at monorepo root
function findEnvFile(): string {
  let dir = process.cwd();
  const { root } = path.parse(dir);
  while (dir !== root) {
    const candidate = path.join(dir, '.env');
    try { require('fs').accessSync(candidate); return candidate; } catch { /* continue */ }
    dir = path.dirname(dir);
  }
  return '.env';
}

dotenv.config({ path: findEnvFile() });

export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  server: ServerConfig;
  csv: CsvConfig;
  reorder: ReorderConfig;
  api: ExternalApiConfig;
  snowflake: SnowflakeConfig;
}

export interface SnowflakeConfig {
  account: string;
  user: string;
  token: string;
  warehouse: string;
  database: string;
  schema: string;
}

export interface ServerConfig {
  port: number;
  host: string;
  corsOrigins: string[];
}

export interface CsvConfig {
  maxFileSizeMb: number;
  allowedMimeTypes: string[];
  uploadDir: string;
}

export interface ReorderConfig {
  checkIntervalMinutes: number;
  defaultLeadTimeDays: number;
  criticalStockThreshold: number;
  lowStockThreshold: number;
}

export interface ExternalApiConfig {
  supplierApiBaseUrl: string;
  supplierApiTimeout: number;
  erpBaseUrl: string;
  erpApiKey: string;
}

const defaults: AppConfig = {
  env: 'development',
  server: {
    port: 3000,
    host: '0.0.0.0',
    corsOrigins: ['http://localhost:5173'],
  },
  csv: {
    maxFileSizeMb: 10,
    allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel'],
    uploadDir: './uploads',
  },
  reorder: {
    checkIntervalMinutes: 60,
    defaultLeadTimeDays: 7,
    criticalStockThreshold: 10,
    lowStockThreshold: 30,
  },
  api: {
    supplierApiBaseUrl: process.env.SUPPLIER_API_URL || 'http://localhost:3001',
    supplierApiTimeout: 5000,
    erpBaseUrl: process.env.ERP_API_URL || 'http://localhost:3002',
    erpApiKey: process.env.ERP_API_KEY || '',
  },
  snowflake: {
    account: process.env.SNOWFLAKE_ACCOUNT || '',
    user: process.env.SNOWFLAKE_USER || '',
    token: process.env.SNOWFLAKE_TOKEN || '',
    warehouse: process.env.SNOWFLAKE_WAREHOUSE || '',
    database: process.env.SNOWFLAKE_DATABASE || '',
    schema: process.env.SNOWFLAKE_SCHEMA || '',
  },
};

export function loadConfig(overrides?: Partial<AppConfig>): AppConfig {
  return {
    ...defaults,
    ...overrides,
    server: { ...defaults.server, ...overrides?.server },
    csv: { ...defaults.csv, ...overrides?.csv },
    reorder: { ...defaults.reorder, ...overrides?.reorder },
    api: { ...defaults.api, ...overrides?.api },
    snowflake: { ...defaults.snowflake, ...overrides?.snowflake },
  };
}

export { defaults as defaultConfig };
