import express from 'express';
import { authenticate } from '../../middlewares/authorization';
import rateLimitter from '../../middlewares/rateLimitter';
import { authorizeRoles, allRead, onlyAdmin } from '../../middlewares/authorizeRoles';
import { validateRequest } from '../../middlewares/validateRequest';
import { temporaryStoreWasteSchema } from '../../request-schemas/temporaryStoreWaste.schema';
import { handoverTreatmentWasteSchema } from '../../request-schemas/handoverWasteTreatment.schema';
import { mobileWasteFollowUpSchema } from '../../request-schemas/mobileWasteFollowUp.schema';
import {
    followUpTreatmentListController,
    getWasteBagDetailController,
    getAllWasteBagController,
    receievmentUpToTreatmentExternal,
    mobileWasteFollowUpController,
    mobileWastePostTreatmentController,
} from '../../controllers/mobile/wasteController';
import { reportWasteBagByStatusController, reportWasteBagController } from '../../controllers/mobile/reportWasteBagController';
import { mobileWastePostTreatmentSchema } from '../../request-schemas/mobileWastePostTreatment.schema';

const router = express.Router();

router.post(
    '/follow-up-treatment',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    validateRequest(temporaryStoreWasteSchema),
    followUpTreatmentListController,
);

router.get(
    '/detail',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteBagDetailController,
);

router.get(
    '/report',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    reportWasteBagController,
);

router.get(
    '/report-waste-status',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    reportWasteBagByStatusController,
);

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllWasteBagController);

router.post(
    '/receiving-treatment-external',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(handoverTreatmentWasteSchema),
    receievmentUpToTreatmentExternal,
);

router.post(
    '/follow-up-action',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(mobileWasteFollowUpSchema),
    mobileWasteFollowUpController,
);

router.post(
    '/post-treatment',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(mobileWastePostTreatmentSchema),
    mobileWastePostTreatmentController,
);

export default router;
