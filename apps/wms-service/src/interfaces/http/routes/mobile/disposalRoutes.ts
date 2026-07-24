import express from 'express';
import { authenticate } from '../../middlewares/authorization';
import rateLimitter from '../../middlewares/rateLimitter';
import { authorizeRoles, allRead, onlyAdmin } from '../../middlewares/authorizeRoles';
import { getAllDisposalUseCaseController } from '../../controllers/mobile/disposalController';

const router = express.Router();

router.get(
    '',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllDisposalUseCaseController,
);

export default router;
