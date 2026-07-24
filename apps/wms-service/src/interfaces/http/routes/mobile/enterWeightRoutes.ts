import express from 'express';
import { authenticate } from '../../middlewares/authorization';
import rateLimitter from '../../middlewares/rateLimitter';
import { authorizeRoles, allRead, onlyAdmin } from '../../middlewares/authorizeRoles';
import { validateRequest } from '../../middlewares/validateRequest';
import { enterWeightSchema } from '../../request-schemas/enterWeight.schema';
import { createWasteController } from '../../controllers/mobile/enterWeightController';

const router = express.Router();

router.post(
    '',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    validateRequest(enterWeightSchema),
    createWasteController,
);

export default router;
