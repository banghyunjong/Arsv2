import { Router } from 'express';
import type { Providers } from '../providers';

export function reorderRoutes(providers: Providers): Router {
  const router = Router();
  const { reorder: repo } = providers.repos;
  const { reorderEngine } = providers.services;

  router.get('/rules', (_req, res) => {
    const rules = repo.findActiveRules();
    res.json({ success: true, data: rules });
  });

  router.get('/requests/pending', (_req, res) => {
    const requests = repo.findPendingRequests();
    res.json({ success: true, data: requests });
  });

  router.post('/evaluate', (_req, res) => {
    const events = reorderEngine.evaluateAll();
    res.json({ success: true, data: { events, generatedAt: new Date().toISOString() } });
  });

  return router;
}
