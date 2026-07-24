import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import { validateRequest } from '../middlewares/validateRequest';
import rateLimitter from '../middlewares/rateLimitter';
import { createPartnershipSchema } from '../request-schemas/createPartnership.schema';
import { updatePartnershipSchema } from '../request-schemas/updatePartnership.schema';
import {
    createPartnership,
    getPartnershipById,
    getAllPartnerships,
    deletePartnership,
    updatePartnership,
    getHealthcareByThirdPartyAdmin,
    getPartnershipByThirdPartyAdmin,
    getWasteClassificationByHealthcare,
    getWasteClassificationByConsumerIdAndProviderId,
    getHasMultiplePartnership,
    findOneThirdParty,
} from '../controllers/partnershipController';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    onlyAdminHF,
    onlyHf,
    onlyAdmin,
} from '../middlewares/authorizeRoles';

const router = Router();

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllPartnerships);
router.get('/multiple-transporter', authenticate, rateLimitter, authorizeRoles(allRead), getHasMultiplePartnership);
router.get('/third-parties', authenticate, rateLimitter, authorizeRoles(allRead), findOneThirdParty);
router.get(
    '/healthcare-thirdparty',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getHealthcareByThirdPartyAdmin,
);
router.get(
    '/thirdparty',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getPartnershipByThirdPartyAdmin,
);
router.get(
    '/waste-classification',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteClassificationByHealthcare,
);
router.get(
    '/waste-classification-consumer-thirdparty',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteClassificationByConsumerIdAndProviderId,
);

router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createPartnershipSchema),
    createPartnership,
);
router
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getPartnershipById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlyAdmin),
        validateRequest(updatePartnershipSchema),
        updatePartnership,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlyAdmin), deletePartnership);

export default router;
