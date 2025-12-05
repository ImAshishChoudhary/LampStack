import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware'
import { asyncHandler } from '../utils/asyncHandler.util'

import multer from "multer";
const upload = multer({ dest: 'uploads/' })

import { FileController } from '../controllers/file.controller'

const router = Router();
router.use(authenticateJWT)

router.post('/upload', upload.single('file'), asyncHandler(FileController.upload))

export default router;
