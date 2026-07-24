import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import { allRead, authorizeRoles, onlyAdmin } from '../middlewares/authorizeRoles';
import { validateRequest } from '../middlewares/validateRequest';
import { getAllUsers, updateUsers } from '../controllers/usersController';
import { updateUsersSchema } from '../request-schemas/updateUsers.schema';

const router = Router();
router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllUsers);
router
    .route('/:id')
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateUsersSchema),
        updateUsers,
    );

export default router;
