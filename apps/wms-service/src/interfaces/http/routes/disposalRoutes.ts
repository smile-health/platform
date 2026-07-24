import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import { allRead, authorizeRoles } from '../middlewares/authorizeRoles';
import { createDisposedBastSchema } from '../request-schemas/createDisposedBast.schema';
import {
    confirmationBastNumber,
    createDispose,
    getAllDisposalController,
    getDisposal,
} from '../controllers/disposalController';
import { updateDisposedBastSchema } from '../request-schemas/updateDisposedBast.schema';

const router = Router();

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllDisposalController);
router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    validateRequest(createDisposedBastSchema),
    createDispose,
);

router.put(
    '/confirm',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    validateRequest(updateDisposedBastSchema),
    confirmationBastNumber,
);

export default router;
