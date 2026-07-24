import { Router } from 'express';
import rateLimitter from '../middlewares/rateLimitter';
import { validateRequest } from '../middlewares/validateRequest';
import { createWasteSchema } from '../request-schemas/createWaste.schema';
import { authenticate } from '../middlewares/authorization';
import { allRead, authorizeRoles, onlyAdmin } from '../middlewares/authorizeRoles';
import { createWasteRecordController, getAllWasteRecordController, getWasteRecordCharacteristicsSummaryExportExcel } from '../controllers/wasteRecordController';

const router = Router();

router.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlyAdmin),
    validateRequest(createWasteSchema),
    createWasteRecordController,
);

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllWasteRecordController);

router.get(
    '/export',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteRecordCharacteristicsSummaryExportExcel,
);

export default router;
