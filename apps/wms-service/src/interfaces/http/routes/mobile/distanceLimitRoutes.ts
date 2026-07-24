import express from 'express';
import { authenticate } from '../../middlewares/authorization';
import rateLimitter from '../../middlewares/rateLimitter';
import { authorizeRoles, allRead, onlyAdmin } from '../../middlewares/authorizeRoles';
import { validateDistanceLimit } from '../../controllers/mobile/distanceLimitController';
import { validateRequest } from '../../middlewares/validateRequest';
import { mobileDistanceLimitSchema } from '../../request-schemas/mobileDistanceLimit.schema';

const router = express.Router();

router.patch(
    '/distance-limit',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    validateRequest(mobileDistanceLimitSchema),
    validateDistanceLimit,
);

export default router;
