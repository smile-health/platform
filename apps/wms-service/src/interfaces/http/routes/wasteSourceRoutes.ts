import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createWasteSource,
    deleteWasteSource,
    getAllWasteSources,
    getWasteSourceById,
    updateWasteSource,
    patchWasteSource,
} from '../controllers/wasteSourceController';
import { createWasteSourceSchema } from '../request-schemas/createWasteSource.schema';
import { updateWasteSourceSchema } from '../request-schemas/updateWasteSource.schema';
import { authorizeRoles, onlyAdmin, allRead, allGovernment } from '../middlewares/authorizeRoles';

const wasteSourceRoutes = Router();

wasteSourceRoutes.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllWasteSources);

wasteSourceRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createWasteSourceSchema),
    createWasteSource,
);

wasteSourceRoutes
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getWasteSourceById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateWasteSourceSchema),
        updateWasteSource,
    )
    .patch(authenticate, rateLimitter, authorizeRoles(onlyAdmin), patchWasteSource)
    .delete(authenticate, rateLimitter, authorizeRoles(onlyAdmin), deleteWasteSource);

export default wasteSourceRoutes;
