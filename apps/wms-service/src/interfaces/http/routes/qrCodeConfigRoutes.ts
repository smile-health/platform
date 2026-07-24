import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createQrCodeConfig,
    deleteQrCodeConfig,
    getAllQrCodeConfigs,
    getQrCodeConfigById,
    updateQrCodeConfig,
} from '../controllers/qrCodeConfigController';
import { createQrCodeConfigSchema } from '../request-schemas/createQrCodeConfig.schema';
import { updateQrCodeConfigSchema } from '../request-schemas/updateQrCodeConfig.schema';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyAdminHF,
    onlyHf,
    onlyAdmin,
} from '../middlewares/authorizeRoles';

const qrCodeConfigRoutes = Router();

qrCodeConfigRoutes.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllQrCodeConfigs,
);

qrCodeConfigRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createQrCodeConfigSchema),
    createQrCodeConfig,
);

qrCodeConfigRoutes
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getQrCodeConfigById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateQrCodeConfigSchema),
        updateQrCodeConfig,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlyAdmin), deleteQrCodeConfig);

export default qrCodeConfigRoutes;
