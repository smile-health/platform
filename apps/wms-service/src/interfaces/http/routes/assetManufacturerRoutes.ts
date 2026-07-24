import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createAssetManufacturer,
    getAllAssetManufacturers,
    getAssetManufacturerById,
    updateAsetManufacturer,
    deleteManufacturer,
} from '../controllers/assetManufacturerController';
import { createAssetManufacturerSchema } from '../request-schemas/createAssetManufacturer.schema';
import { updateAssetManufacturerSchema } from '../request-schemas/updateAssetManufacturer.schema';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyManager,
} from '../middlewares/authorizeRoles';

const router = Router();

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllAssetManufacturers);
router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlySuperAdmin),
    validateRequest(createAssetManufacturerSchema),
    createAssetManufacturer,
);
router
    .route('/:id')
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlySuperAdmin),
        validateRequest(updateAssetManufacturerSchema),
        updateAsetManufacturer,
    )
    .delete(authenticate, rateLimitter, deleteManufacturer)
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getAssetManufacturerById);

export default router;
