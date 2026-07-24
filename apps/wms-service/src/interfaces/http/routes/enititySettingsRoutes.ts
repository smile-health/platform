import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createEntitySettings,
    deleteEntitiySettings,
    getAllEntitySettings,
    getEntitySettingsById,
    updateEntitySettings,
} from '../controllers/entitySettingsController';
import { createEntitySettingsSchema } from '../request-schemas/createEnititySettings.schema';
import { updateEntitySettingsSchema } from '../request-schemas/updateEnititySettings.schema';
import { authorizeRoles, onlyAdmin, allRead, onlyManager } from '../middlewares/authorizeRoles';

const router = Router();

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllEntitySettings);
router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createEntitySettingsSchema),
    createEntitySettings,
);
router
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getEntitySettingsById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateEntitySettingsSchema),
        updateEntitySettings,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlyAdmin), deleteEntitiySettings);

export default router;
