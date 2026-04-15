import { Router } from 'express';
import multer from 'multer';
import type { AppConfig } from '@arsv2/config';
import type { Providers } from '../providers';

export function uploadRoutes(providers: Providers, config: AppConfig): Router {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.csv.maxFileSizeMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (config.csv.allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    },
  });

  router.post('/products', upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
      return;
    }
    const content = req.file.buffer.toString('utf-8');
    const result = providers.services.csvUpload.uploadProducts(req.file.originalname, content);
    res.json({ success: true, data: result });
  });

  router.post('/inventory', upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
      return;
    }
    const content = req.file.buffer.toString('utf-8');
    const result = providers.services.csvUpload.uploadInventory(req.file.originalname, content);
    res.json({ success: true, data: result });
  });

  return router;
}
