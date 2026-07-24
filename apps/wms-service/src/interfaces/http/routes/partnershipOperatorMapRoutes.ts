import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createPartnershipOperatorMap,
    getAllPartnershipOperatorMaps,
    deletePartnershipOperatorMap,
    updatePartnershipOperatorMap,
    getAllPartnershipOperatorMapsByThirdpartyAdmin,
    getOperatorsFromOperatorMap,
} from '../controllers/partnershipOperatorMapController';
import { createPartnershipOperatorMapSchema } from '../request-schemas/createPartnershipOperatorMap.schema';
import { updatePartnershipOperatorMapSchema } from '../request-schemas/updatePartnershipOperatorMap.schema';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyAdminHF,
    onlyHf,
    onlyAdmin,
} from '../middlewares/authorizeRoles';

const partnershipOperatorMapRoutes = Router();

partnershipOperatorMapRoutes.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllPartnershipOperatorMaps,
);

partnershipOperatorMapRoutes.get(
    '/operator-thirdparty',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllPartnershipOperatorMapsByThirdpartyAdmin,
);

partnershipOperatorMapRoutes.delete(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    deletePartnershipOperatorMap,
);

partnershipOperatorMapRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createPartnershipOperatorMapSchema),
    createPartnershipOperatorMap,
);

partnershipOperatorMapRoutes.put(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(updatePartnershipOperatorMapSchema),
    updatePartnershipOperatorMap,
);

partnershipOperatorMapRoutes.get(
    '/operator-from-operatormap',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getOperatorsFromOperatorMap,
);

export default partnershipOperatorMapRoutes;
