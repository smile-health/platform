import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createWasteBagTreatmentRequest,
    deleteWasteBagTreatmentRequest,
    getAllWasteBagTreatmentRequests,
    getWasteBagTreatmentRequestById,
    updateWasteBagTreatmentRequest,
} from '../controllers/wasteBagTreatmentRequestController';
import { createWasteBagTreatmentRequestSchema } from '../request-schemas/createWasteBagTreatmentRequest.schema';
import { updateWasteBagTreatmentRequestSchema } from '../request-schemas/updateWasteBagTreatmentRequest.schema';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyAdminHF,
    onlyHf,
    onlyAdmin,
} from '../middlewares/authorizeRoles';

const wasteBagTreatmentRequestRoutes = Router();

wasteBagTreatmentRequestRoutes.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllWasteBagTreatmentRequests,
);

wasteBagTreatmentRequestRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createWasteBagTreatmentRequestSchema),
    createWasteBagTreatmentRequest,
);

wasteBagTreatmentRequestRoutes
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getWasteBagTreatmentRequestById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateWasteBagTreatmentRequestSchema),
        updateWasteBagTreatmentRequest,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlyAdmin), deleteWasteBagTreatmentRequest);

export default wasteBagTreatmentRequestRoutes;
