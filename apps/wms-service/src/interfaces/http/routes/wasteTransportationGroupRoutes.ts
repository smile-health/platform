import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createWasteTransportationGroup,
    deleteWasteTransportationGroup,
    getAllWasteTransportationGroups,
    getWasteTransportationGroupById,
    updateWasteTransportationGroup,
} from '../controllers/wasteTransportationGroupController';
import { createWasteTransportationGroupSchema } from '../request-schemas/createWasteTransportationGroup.schema';
import { updateWasteTransportationGroupSchema } from '../request-schemas/updateWasteTransportationGroup.schema';
import { authorizeRoles, onlyAdmin, allRead, allGovernment } from '../middlewares/authorizeRoles';

const wasteTransportationGroupRoutes = Router();

wasteTransportationGroupRoutes.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllWasteTransportationGroups,
);

wasteTransportationGroupRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createWasteTransportationGroupSchema),
    createWasteTransportationGroup,
);

wasteTransportationGroupRoutes.get(
    '/detail',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteTransportationGroupById,
);
wasteTransportationGroupRoutes
    .route('/:id')
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateWasteTransportationGroupSchema),
        updateWasteTransportationGroup,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlyAdmin), deleteWasteTransportationGroup);

export default wasteTransportationGroupRoutes;
