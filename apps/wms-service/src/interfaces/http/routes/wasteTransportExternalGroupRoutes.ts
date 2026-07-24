import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    getAllWasteTransportExternalGroup,
    getWasteTransportExternalGroup,
} from '../controllers/wasteTransportExternalGroupController';

import { authorizeRoles, allRead } from '../middlewares/authorizeRoles';

const route = Router();

route.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllWasteTransportExternalGroup,
);

route
    .route('/detail')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getWasteTransportExternalGroup);

export default route;
