import { Router } from 'express';
import { uploadProviderFile, getUploadHistory, upload } from '../controllers/upload.controller';

const router = Router();

router.post('/providers', upload.single('file'), uploadProviderFile);

router.get('/history', getUploadHistory);

export default router;
