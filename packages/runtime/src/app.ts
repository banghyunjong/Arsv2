import express from 'express';
import cors from 'cors';
import { loadConfig } from '@arsv2/config';
import { productRoutes } from './routes/products';
import { inventoryRoutes } from './routes/inventory';
import { reorderRoutes } from './routes/reorder';
import { uploadRoutes } from './routes/upload';
import { healthRoutes } from './routes/health';
import { arsRoutes } from './routes/ars';
import { createProviders } from './providers';

export function createApp() {
  const config = loadConfig();
  const app = express();
  const providers = createProviders(config);

  app.use(cors({ origin: config.server.corsOrigins }));
  app.use(express.json());

  // Routes
  app.use('/api/health', healthRoutes());
  app.use('/api/products', productRoutes(providers));
  app.use('/api/inventory', inventoryRoutes(providers));
  app.use('/api/reorder', reorderRoutes(providers));
  app.use('/api/upload', uploadRoutes(providers, config));
  app.use('/api/ars', arsRoutes(config));

  return { app, config, providers };
}
