import { Router } from 'express';
import {
    createHealthcareFacilityAssetActivity,
    getAllHealthcareFacilityAssetActivity,
} from '../controllers/healthcareFacilityAssetActivityController';
import { validateRequest } from '../middlewares/validateRequest';
import { createHealthcareFacilityAssetActivitySchema } from '../request-schemas/createHealthcareFacilityAssetActivity.schema';
import rateLimitter from '../middlewares/rateLimitter';
import { authenticate } from '../middlewares/authorization';
import { authorizeRoles, onlyHf, allRead } from '../middlewares/authorizeRoles';

const router = Router();

router.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllHealthcareFacilityAssetActivity,
);
router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyHf),
    validateRequest(createHealthcareFacilityAssetActivitySchema),
    createHealthcareFacilityAssetActivity,
);

export default router;
