import { Router } from 'express';
import rateLimitter from '../middlewares/rateLimitter';
import { authenticate } from '../middlewares/authorization';
import { getRegionById, distantLimit } from '../controllers/regionController';
import { authorizeRoles, allRead } from '../middlewares/authorizeRoles';

const routes = Router();

routes.get('/:id', rateLimitter, authorizeRoles(allRead), getRegionById);
routes.get('/distance-limit', authenticate, rateLimitter, distantLimit);

export default routes;
