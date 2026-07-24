import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    getAllWasteBagTreatmentGroup,
    getPendingWasteTreatmentGroupsController,
    getWasteBagTreatmentGroup,
} from '../controllers/wasteTreatmentGroupController';

import { authorizeRoles, allRead } from '../middlewares/authorizeRoles';

const route = Router();

route.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllWasteBagTreatmentGroup);

route
    .route('/detail')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getWasteBagTreatmentGroup);

route
    .route('/pending')
    .get(
        authenticate,
        rateLimitter,
        authorizeRoles(allRead),
        getPendingWasteTreatmentGroupsController,
    );

export default route;
