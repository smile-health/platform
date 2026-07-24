import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createMultipleHealthcarePartnerVehicle,
    createPartnerVehicle,
    deletePartnerVehicle,
    getAllPartnerVehicles,
    getPartnerVehicleById,
    getPartnerVehicleExportExcel,
    updatePartnerVehicle,
} from '../controllers/partnerVehicleController';
import { createPartnerVehicleSchema } from '../request-schemas/createPartnerVehicle.schema';
import { updatePartnerVehicleSchema } from '../request-schemas/updatePartnerVehicle.schema';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyAdminHF,
    onlyHf,
    onlyAdmin,
} from '../middlewares/authorizeRoles';
import { createMultipleHealtcarePartnerVehicleSchema } from '../request-schemas/createMultipleHealthcarePartnerVehicle.schema';

const partnerVehicleRoutes = Router();

partnerVehicleRoutes.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllPartnerVehicles,
);

partnerVehicleRoutes.get(
    '/export',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getPartnerVehicleExportExcel,
);

partnerVehicleRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createPartnerVehicleSchema),
    createPartnerVehicle,
);

partnerVehicleRoutes.post(
    '/bulk-healthcare',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createMultipleHealtcarePartnerVehicleSchema),
    createMultipleHealthcarePartnerVehicle,
);

partnerVehicleRoutes
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getPartnerVehicleById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updatePartnerVehicleSchema),
        updatePartnerVehicle,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlyAdmin), deletePartnerVehicle);

export default partnerVehicleRoutes;
