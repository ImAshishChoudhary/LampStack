import { Router } from 'express';
import {
  startValidation,
  getJobStatus,
  validateAndSave,
  listJobs,
  agentHealthCheck,
} from '../controllers/agent.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/health', agentHealthCheck);

router.post('/validate/:providerId', startValidation);

router.get('/validate/job/:jobId', getJobStatus);

router.post('/validate/:providerId/sync', validateAndSave);

router.get('/jobs', listJobs);

export default router;
