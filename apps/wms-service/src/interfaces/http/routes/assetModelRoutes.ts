import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createAssetModel,
    deleteAssetModel,
    getAllAssetModels,
    getAssetModelById,
    updateAssetModel,
} from '../controllers/assetModelController';
import { createAssetSchema } from '../request-schemas/createAsset.schema';
import { updateAssetSchema } from '../request-schemas/updateAsset.schema';

const router = Router();

router.get('/', authenticate, rateLimitter, getAllAssetModels);
router.post('/', authenticate, rateLimitter, validateRequest(createAssetSchema), createAssetModel);
router
    .route('/:id')
    .get(authenticate, rateLimitter, getAssetModelById)
    .put(authenticate, rateLimitter, validateRequest(updateAssetSchema), updateAssetModel)
    .delete(authenticate, rateLimitter, deleteAssetModel);

export default router;
