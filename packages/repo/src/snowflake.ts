/**
 * @arsv2/repo — Snowflake connection module
 * Uses JWT PAT authentication via PROGRAMMATIC_ACCESS_TOKEN.
 */

import snowflake from 'snowflake-sdk';
import type { SnowflakeConfig } from '@arsv2/config';

export function createSnowflakeConnection(config: SnowflakeConfig): snowflake.Connection {
  return snowflake.createConnection({
    account: config.account,
    username: config.user,
    authenticator: 'PROGRAMMATIC_ACCESS_TOKEN',
    token: config.token,
    warehouse: config.warehouse,
    database: config.database,
    schema: config.schema,
  });
}

export async function connectAndTest(connection: snowflake.Connection): Promise<string> {
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        reject(new Error(`Snowflake connection failed: ${err.message}`));
        return;
      }

      connection.execute({
        sqlText: 'SELECT CURRENT_TIMESTAMP() AS ts, CURRENT_WAREHOUSE() AS wh, CURRENT_DATABASE() AS db, CURRENT_SCHEMA() AS sc',
        complete: (err, _stmt, rows) => {
          if (err) {
            reject(new Error(`Snowflake query failed: ${err.message}`));
            return;
          }

          const row = rows?.[0] as Record<string, string> | undefined;
          const result = row
            ? `Connected! ts=${row['TS']}, warehouse=${row['WH']}, database=${row['DB']}, schema=${row['SC']}`
            : 'Connected but no result returned';
          resolve(result);
        },
      });
    });
  });
}

export function destroyConnection(connection: snowflake.Connection): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.destroy((err) => {
      if (err) reject(new Error(`Snowflake disconnect failed: ${err.message}`));
      else resolve();
    });
  });
}
