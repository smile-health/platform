import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createWasteBagQrCode,
    deleteWasteBagQrCode,
    getAllWasteBagQrCodes,
    getWasteBagQrCodeById,
    updateWasteBagQrCode,
} from '../controllers/wasteBagQrCodeController';
import { createWasteBagQrCodeSchema } from '../request-schemas/createWasteBagQrCode.schema';
import { updateWasteBagQrCodeSchema } from '../request-schemas/updateWasteBagQrCode.schema';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyAdminHF,
    onlyHf,
    onlyAdmin,
} from '../middlewares/authorizeRoles';

const wasteBagQrCodeRoutes = Router();

wasteBagQrCodeRoutes.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllWasteBagQrCodes,
);

wasteBagQrCodeRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createWasteBagQrCodeSchema),
    createWasteBagQrCode,
);

wasteBagQrCodeRoutes
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getWasteBagQrCodeById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updateWasteBagQrCodeSchema),
        updateWasteBagQrCode,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlyAdmin), deleteWasteBagQrCode);

export default wasteBagQrCodeRoutes;
