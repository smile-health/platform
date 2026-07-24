import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    getAllWasteTreatmentExternalGroup,
    getWasteTreatmentExternalGroup,
} from '../controllers/wasteTreatmentExternalGroupController';

import { authorizeRoles, allRead } from '../middlewares/authorizeRoles';

const wasteTreatmentExternalGroupRoutes = Router();

wasteTreatmentExternalGroupRoutes.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllWasteTreatmentExternalGroup,
);

wasteTreatmentExternalGroupRoutes
    .route('/detail')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getWasteTreatmentExternalGroup);

export default wasteTreatmentExternalGroupRoutes;
