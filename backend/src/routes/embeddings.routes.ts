import { Router } from 'express';
import { storeEmbeddings, searchSimilar } from '../controllers/embeddings.controller';

const router = Router();

router.post('/store', storeEmbeddings);

router.post('/search', searchSimilar);

export default router;
