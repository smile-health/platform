import express from 'express';
import { authenticate } from '../../middlewares/authorization';
import rateLimitter from '../../middlewares/rateLimitter';
import { authorizeRoles, allRead } from '../../middlewares/authorizeRoles';
import { scanQrCode } from '../../controllers/mobile/scanQrCodeController';

const router = express.Router();

router.get(
    '/:id',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    scanQrCode,
);

export default router;
