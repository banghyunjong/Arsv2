import { Router } from 'express';

export function healthRoutes(): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        version: '2.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  });

  return router;
}
