import { Router } from 'express';
import {
  validateProvider,
  validateAllProviders,
  getProviderValidationHistory,
  getValidationStats,
  applyCorrections,
  getTrustScores,
  storeValidationResult,
  sendProgressUpdate,
} from '../controllers/validation.controller';

const router = Router();

router.post('/results', storeValidationResult);

router.post('/progress', sendProgressUpdate);

router.post('/batch', validateAllProviders);

router.post('/:id', validateProvider);

router.get('/stats', getValidationStats);

router.get('/trust-scores', getTrustScores);

router.get('/:id/history', getProviderValidationHistory);

router.post('/:id/apply', applyCorrections);

export default router;
