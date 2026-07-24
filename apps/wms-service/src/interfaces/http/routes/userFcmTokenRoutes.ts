import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import { getOneByIdentity, createOrUpdateFcmToken } from '../controllers/userFcmTokenController';
import { authorizeRoles, allRead } from '../middlewares/authorizeRoles';

const route = Router();

route.patch('/:token', authenticate, rateLimitter, authorizeRoles(allRead), createOrUpdateFcmToken);

route.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getOneByIdentity);

export default route;
