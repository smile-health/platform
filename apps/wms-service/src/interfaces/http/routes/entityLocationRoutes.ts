import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createEntityLocation,
    deleteEntitiySettings,
    getAllEntityLocation,
    getAllEntityLocationByEntityId,
    getEntityLocationById,
    updateEntityLocation,
} from '../controllers/entityLocationController';
import { createEntityLocationSchema } from '../request-schemas/createEntityLocation.schema';
import { updateEntityLocationSchema } from '../request-schemas/updateEntityLocation.schema';
import { authorizeRoles, onlyAdmin, allRead, onlyManager } from '../middlewares/authorizeRoles';

const router = Router();

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllEntityLocation);
router.get(
    '/list',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllEntityLocationByEntityId,
);
router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createEntityLocationSchema),
    createEntityLocation,
);
router
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getEntityLocationById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateEntityLocationSchema),
        updateEntityLocation,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlyAdmin), deleteEntitiySettings);

export default router;
