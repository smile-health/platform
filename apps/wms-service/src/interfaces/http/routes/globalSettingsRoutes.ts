import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createGlobalSettings,
    deleteEntitiySettings,
    getAllGlobalSettings,
    getGlobalSettingsById,
    updateGlobalSettings,
} from '../controllers/globalSettingsController';
import { createGlobalSettingsSchema } from '../request-schemas/createGlobalSettings.schema';
import { updateGlobalSettingsSchema } from '../request-schemas/updateGlobalSettings.schema';
import { authorizeRoles, onlySuperAdmin, allRead } from '../middlewares/authorizeRoles';

const router = Router();

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllGlobalSettings);
router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlySuperAdmin),
    validateRequest(createGlobalSettingsSchema),
    createGlobalSettings,
);
router
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getGlobalSettingsById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlySuperAdmin),
        validateRequest(updateGlobalSettingsSchema),
        updateGlobalSettings,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlySuperAdmin), deleteEntitiySettings);

export default router;
