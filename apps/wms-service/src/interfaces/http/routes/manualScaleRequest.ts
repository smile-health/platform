import { Router } from 'express';
import rateLimitter from '../middlewares/rateLimitter';
import { authenticate } from '../middlewares/authorization';
import {
    activateManualScaleRequest,
    createManualScaleRequest,
    getAllManualScaleRequest,
} from '../controllers/manualScaleRequestController';
import { authorizeRoles, allRead, onlyAdminHF } from '../middlewares/authorizeRoles';
import { validateRequest } from '../middlewares/validateRequest';
import { createManualScaleRequestSchema } from '../request-schemas/manualScaleRequest.schema';

const manualScaleRequest = Router();

manualScaleRequest.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    validateRequest(createManualScaleRequestSchema),
    createManualScaleRequest,
);

manualScaleRequest.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllManualScaleRequest,
);

manualScaleRequest
    .route('/activate')
    .patch(authenticate, rateLimitter, authorizeRoles(onlyAdminHF), activateManualScaleRequest);

export default manualScaleRequest;
