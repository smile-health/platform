import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createAssetDongle,
    deleteAssetDongle,
    getAllAssetDongle,
} from '../controllers/assetDongleController';
import { createAssetDongleSchema } from '../request-schemas/createAssetDongle.schema';

const router = Router();

router.get('/', authenticate, rateLimitter, getAllAssetDongle);
router.post('/', authenticate, rateLimitter, validateRequest(createAssetDongleSchema), createAssetDongle);
router
    .route('/:assetId')
    .delete(authenticate, rateLimitter, deleteAssetDongle);

export default router;
