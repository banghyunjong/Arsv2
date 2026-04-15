import { Router } from 'express';
import type { AppConfig } from '@arsv2/config';
import { queryArsDetail } from '@arsv2/repo';

export function arsRoutes(config: AppConfig): Router {
  const router = Router();

  router.get('/detail', async (req, res) => {
    try {
      const year = Number(req.query.year) || 2026;
      const rows = await queryArsDetail(config.snowflake, year);
      res.json({ success: true, data: rows });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.log(JSON.stringify({ level: 'error', msg: `ARS detail query failed: ${msg}` }));
      res.status(500).json({ success: false, error: msg });
    }
  });

  return router;
}
