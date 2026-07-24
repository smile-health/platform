import { Router } from 'express';
import {
    createWasteClassification,
    getAllWasteClassification,
    updateWasteClassification,
    deleteWasteClassification,
    getWasteClassificationById,
} from '../controllers/wasteClassificationController';
import { validateRequest } from '../middlewares/validateRequest';
import { createWasteClassificationSchema } from '../request-schemas/createWasteClassification.schema';
import { updateWasteClassificationSchema } from '../request-schemas/updateWasteClassification.schema';
import rateLimitter from '../middlewares/rateLimitter';
import { authenticate } from '../middlewares/authorization';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    allGovernment,
} from '../middlewares/authorizeRoles';

const router = Router();
router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllWasteClassification);
router.post(
    '/',
    authenticate,
    rateLimitter,
    validateRequest(createWasteClassificationSchema),
    authorizeRoles(onlySuperAdmin),
    createWasteClassification,
);

router
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getWasteClassificationById)
    .put(
        authenticate,
        rateLimitter,
        validateRequest(updateWasteClassificationSchema),
        authorizeRoles(onlySuperAdmin),
        updateWasteClassification,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlySuperAdmin), deleteWasteClassification);

export default router;
