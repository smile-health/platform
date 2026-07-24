import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createPartnershipVehicleMap,
    getAllPartnershipVehicleMaps,
    deletePartnershipVehicleMap,
} from '../controllers/partnershipVehicleMapController';
import { createPartnershipVehicleMapSchema } from '../request-schemas/createPartnershipVehicleMap.schema';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyAdminHF,
    onlyHf,
    onlyAdmin,
} from '../middlewares/authorizeRoles';

const partnershipVehicleMapRoutes = Router();

partnershipVehicleMapRoutes.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllPartnershipVehicleMaps,
);

partnershipVehicleMapRoutes.delete(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    deletePartnershipVehicleMap,
);

partnershipVehicleMapRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createPartnershipVehicleMapSchema),
    createPartnershipVehicleMap,
);

export default partnershipVehicleMapRoutes;
