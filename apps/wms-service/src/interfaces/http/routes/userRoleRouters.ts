import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import { getAllUserRole } from '../controllers/userRoleController';

const userRoleRoutes = Router();

userRoleRoutes.get('', getAllUserRole);

export default userRoleRoutes;
