import { Router } from 'express';
import type { ApiResponse, InventoryRecord } from '@arsv2/types';
import type { Providers } from '../providers';

export function inventoryRoutes(providers: Providers): Router {
  const router = Router();
  const { inventory: repo } = providers.repos;
  const { inventoryAnalyzer } = providers.services;

  router.get('/', (_req, res) => {
    const data = repo.findAll();
    const response: ApiResponse<InventoryRecord[]> = {
      success: true,
      data,
      meta: { total: data.length, timestamp: new Date().toISOString() },
    };
    res.json(response);
  });

  router.get('/summary', (_req, res) => {
    const summary = inventoryAnalyzer.getSummary();
    res.json({ success: true, data: summary });
  });

  router.get('/low-stock', (_req, res) => {
    const items = inventoryAnalyzer.getLowStockItems();
    res.json({ success: true, data: items, meta: { total: items.length, timestamp: new Date().toISOString() } });
  });

  return router;
}
