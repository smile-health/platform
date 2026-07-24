import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createHealthcareFacilityAsset,
    getHealthcareFacilityAssetById,
    getAllHealthcareFacilityAssets,
    updateHealthcareFacilityAsset,
    deleteHealthcareFacilityAsset,
    patchHealthcareFacilityAsset,
    getAllHealthcareFacilityAssetsByEntityId,
} from '../controllers/healthcareFacilityAssetController';
import { createHealthcareFacilityAssetSchema } from '../request-schemas/createHealthcareFacilityAsset.schema';
import { updateHealthcareFacilityAssetSchema } from '../request-schemas/updateHealthcareFacilityAsset.schema';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyAdminHF,
    onlyHf,
} from '../middlewares/authorizeRoles';

const router = Router();

router.get('/', authenticate, rateLimitter, authorizeRoles(onlyHf), getAllHealthcareFacilityAssets);
router.get(
    '/entity',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyHf),
    getAllHealthcareFacilityAssetsByEntityId,
);
router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles([...onlySuperAdmin, ...onlyAdminHF]),
    validateRequest(createHealthcareFacilityAssetSchema),
    createHealthcareFacilityAsset,
);
router
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(onlyHf), getHealthcareFacilityAssetById)
    .put(
        rateLimitter,
        authenticate,
        authorizeRoles([...onlySuperAdmin, ...onlyAdminHF]),
        validateRequest(updateHealthcareFacilityAssetSchema),
        updateHealthcareFacilityAsset,
    )
    .patch(
        authenticate,
        rateLimitter,
        authorizeRoles([...onlySuperAdmin, ...onlyAdminHF]),
        patchHealthcareFacilityAsset,
    )
    .delete(
        authenticate,
        rateLimitter,
        authorizeRoles([...onlySuperAdmin, ...onlyAdminHF]),
        deleteHealthcareFacilityAsset,
    );

export default router;
