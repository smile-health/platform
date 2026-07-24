import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createWasteTransportationRequest,
    deleteWasteTransportationRequest,
    getAllWasteTransportationRequests,
    getWasteTransportationRequestById,
    updateWasteTransportationRequest,
} from '../controllers/wasteTransportationRequestController';
import { createWasteTransportationRequestSchema } from '../request-schemas/createWasteTransportationRequest.schema';
import { updateWasteTransportationRequestSchema } from '../request-schemas/updateWasteTransportationRequest.schema';
import { authorizeRoles, onlyAdmin, allRead, allGovernment } from '../middlewares/authorizeRoles';

const wasteTransportationRequestRoutes = Router();

wasteTransportationRequestRoutes.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllWasteTransportationRequests,
);

wasteTransportationRequestRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createWasteTransportationRequestSchema),
    createWasteTransportationRequest,
);

wasteTransportationRequestRoutes
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getWasteTransportationRequestById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateWasteTransportationRequestSchema),
        updateWasteTransportationRequest,
    )
    .delete(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        deleteWasteTransportationRequest,
    );

export default wasteTransportationRequestRoutes;
