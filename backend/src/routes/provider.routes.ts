import { Router } from 'express';
import {
  getAllProviders,
  getProviderStats,
  getProviderById,
  submitFeedback,
  getValidationJobs,
  getTrustScores
} from '../controllers/provider.controller';

const router = Router();

router.get('/', getAllProviders);
router.get('/stats', getProviderStats);
router.get('/validation-jobs', getValidationJobs);
router.get('/:id', getProviderById);
router.post('/:id/feedback', submitFeedback);

router.get('/trust/scores', getTrustScores);

export default router;
