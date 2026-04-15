/**
 * Standalone Snowflake connection test script.
 * Usage: npx ts-node packages/repo/src/test-snowflake.ts
 */

import { loadConfig } from '@arsv2/config';
import { createSnowflakeConnection, connectAndTest, destroyConnection } from './snowflake';

async function main() {
  const config = loadConfig();
  const sf = config.snowflake;

  console.log(JSON.stringify({
    level: 'info',
    msg: 'Snowflake connection test starting',
    account: sf.account,
    user: sf.user,
    warehouse: sf.warehouse,
    database: sf.database,
    schema: sf.schema,
  }));

  if (!sf.account || !sf.user || !sf.token) {
    console.log(JSON.stringify({ level: 'error', msg: 'Missing Snowflake config. Check .env file.' }));
    process.exit(1);
  }

  const conn = createSnowflakeConnection(sf);

  try {
    const result = await connectAndTest(conn);
    console.log(JSON.stringify({ level: 'info', msg: result }));
  } catch (err) {
    console.log(JSON.stringify({ level: 'error', msg: (err as Error).message }));
    process.exit(1);
  } finally {
    await destroyConnection(conn).catch(() => {});
  }
}

main();
