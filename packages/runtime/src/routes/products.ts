import { Router } from 'express';
import type { ApiResponse, Product } from '@arsv2/types';
import type { Providers } from '../providers';

export function productRoutes(providers: Providers): Router {
  const router = Router();
  const { product: repo } = providers.repos;

  router.get('/', (_req, res) => {
    const data = repo.findAll();
    const response: ApiResponse<Product[]> = {
      success: true,
      data,
      meta: { total: data.length, timestamp: new Date().toISOString() },
    };
    res.json(response);
  });

  router.get('/:id', (req, res) => {
    const product = repo.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
      return;
    }
    res.json({ success: true, data: product });
  });

  return router;
}
