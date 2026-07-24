import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyAdminHF,
    onlyHf,
} from '../middlewares/authorizeRoles';
import {
    createHealthcareAsset,
    getHealthcareAssetById,
    updateHealthcareAsset,
} from '../controllers/healthcareAssetController';
import { createHealthcareAssetSchema } from '../request-schemas/createHealthcareAsset.schema';
import { updateHealthcareAssetSchema } from '../request-schemas/updateHealthcareAsset.schema';

const router = Router();

router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles([...onlySuperAdmin, ...onlyAdminHF]),
    validateRequest(createHealthcareAssetSchema),
    createHealthcareAsset,
);
router
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(onlyHf), getHealthcareAssetById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles([...onlySuperAdmin, ...onlyAdminHF]),
        validateRequest(updateHealthcareAssetSchema),
        updateHealthcareAsset,
    );

export default router;
