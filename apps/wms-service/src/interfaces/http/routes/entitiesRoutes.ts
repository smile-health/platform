import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import { allRead, authorizeRoles, onlyAdmin } from '../middlewares/authorizeRoles';
import {
    getAllEntities,
    getEntitiesById,
    updateEntities,
    updateStatusEntities,
} from '../controllers/entitiesController';
import { validateRequest } from '../middlewares/validateRequest';
import { updateEntitiesSchema } from '../request-schemas/updateEnitities.schema';
import { updateStatusActiveEntitiesSchema } from '../request-schemas/updateStatusActiveEntities.schema';

const router = Router();
router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getEntitiesById);
router.get('/all', authenticate, rateLimitter, authorizeRoles(allRead), getAllEntities);
router
    .route('/')
    .patch(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateEntitiesSchema),
        updateEntities,
    );

router
    .route('/:id')
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateStatusActiveEntitiesSchema),
        updateStatusEntities,
    );

export default router;
