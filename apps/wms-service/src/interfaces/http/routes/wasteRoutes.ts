import { Router } from 'express';
import rateLimitter from '../middlewares/rateLimitter';
import {
  createWasteController,
  temporaryStoreWasteController,
  coldStoreWasteController,
  internalLandfillWasteBagController,
  sterilisedWasteBagController,
  incinerateWasteBagController,
  getAllWasteController,
  followUpToTransporter,
  handoverUpToTransporter,
  followUpToTransporterExternal,
  handoverUpToTransporterExternal,
  pickUpToTransporterExternal,
  receievmentUpToTreatmentExternal,
  followUpTreatmentListController,
  handoverToTreatmentExternal,
} from '../controllers/wasteController';
import { validateRequest } from '../middlewares/validateRequest';
import { createWasteSchema } from '../request-schemas/createWaste.schema';
import { temporaryStoreWasteSchema } from '../request-schemas/temporaryStoreWaste.schema';
import { authenticate } from '../middlewares/authorization';
import { coldStoreWasteSchema } from '../request-schemas/coldStoreWaste.schema';
import { sterilisedWasteSchema } from '../request-schemas/sterilisedWaste.schema';
import { incinerateWasteSchema } from '../request-schemas/incinerateWaste.schema';
import { authorizeRoles, onlyAdmin, allRead, allGovernment } from '../middlewares/authorizeRoles';
import { handoverTransportWasteSchema } from '../request-schemas/handoverWasteTransport.schema';
import { manifestInMemory, compressManifestImage } from '../middlewares/fileUpload';
import { followUpTransportWasteSchema } from '../request-schemas/followUpWasteTransport.schema';
import { handoverTreatmentWasteSchema } from '../request-schemas/handoverWasteTreatment.schema';
import { pickUprTransportWasteSchema } from '../request-schemas/pickupWasteTransport.schema';
import { handoverTransportExternalWasteSchema } from '../request-schemas/handoverWasteTreatmentExternal.schema';
import {
  getAllTransactionWasteBagController,
  getWasteBagDetailsInternalTreatmentController,
  getWasteBagHistoryController,
  getWasteBagLogBookController,
  getWasteBagSummaryByCharacteristicsController,
  getWasteGroupDetailsController,
  getWasteSourceSummaryController,
} from '../controllers/reportWasteBagController';
import { getLogBookExportExcel } from '../controllers/logBookExportExcelController';
import {
  getWasteBagExportExcel,
  getWasteCharacteristicsSummaryExportExcel,
  getWasteExternalExportExcel,
  getWasteGroupExportExcel,
  getWasteSourceSummaryExportExcel,
  getWasteTrackingAllExportExcel,
} from '../controllers/wasteTrackingExportExcelController';

const router = Router();

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllWasteController);
router.get(
  '/transactions',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getAllTransactionWasteBagController,
);
router.get(
  '/transactions/export',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteBagExportExcel,
);
router.get(
  '/tracking-by-characteristics',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteBagSummaryByCharacteristicsController,
);
router.get(
  '/tracking-by-characteristics/export',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteCharacteristicsSummaryExportExcel,
);
router.get(
  '/tracking-by-waste-source',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteSourceSummaryController,
);
router.get(
  '/tracking-by-waste-source/export',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteSourceSummaryExportExcel,
);
router.get(
  '/waste-tracking-all/export',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteTrackingAllExportExcel,
);
router.get(
  '/logbook',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteBagLogBookController,
);
router.get(
  '/logbook/export',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getLogBookExportExcel,
);
router.get(
  '/waste-group/export',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteGroupExportExcel,
);
router.get(
  '/waste-external/export',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteExternalExportExcel,
);
router.get(
  '/transaction-history',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteBagHistoryController,
);

router.post(
  '/follow-up-treatment',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  validateRequest(temporaryStoreWasteSchema),
  followUpTreatmentListController,
);

router.get(
  '/waste-group-details/:wasteGroupId',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteGroupDetailsController,
);

router.get(
  '/waste-bag-internal-treatment-details/:wasteBagQrCodeId',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  getWasteBagDetailsInternalTreatmentController,
);

router.post(
  '/',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(createWasteSchema),
  createWasteController,
);
router.patch(
  '/temporary-store',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(temporaryStoreWasteSchema),
  temporaryStoreWasteController,
);
router.patch(
  '/cold-store',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(coldStoreWasteSchema),
  coldStoreWasteController,
);
router.patch(
  '/internal_landfill',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(sterilisedWasteSchema),
  internalLandfillWasteBagController,
);
router.patch(
  '/sterilise',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(sterilisedWasteSchema),
  sterilisedWasteBagController,
);
router.patch(
  '/incinerate',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(incinerateWasteSchema),
  incinerateWasteBagController,
);

router.patch(
  '/follow-up/transport-request',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(followUpTransportWasteSchema),
  followUpToTransporter,
);

router.post(
  '/handover/transport-request',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  manifestInMemory.single('manifest'),
  compressManifestImage,
  validateRequest(handoverTransportWasteSchema),
  handoverUpToTransporter,
);

router.patch(
  '/follow-up/transport-external-request',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(followUpTransportWasteSchema),
  followUpToTransporterExternal,
);

router.post(
  '/handover/transport-external-request',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  manifestInMemory.single('manifest'),
  compressManifestImage,
  validateRequest(handoverTransportWasteSchema),
  handoverUpToTransporterExternal,
);

router.post(
  '/pick-up/transport-external-request',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(pickUprTransportWasteSchema),
  pickUpToTransporterExternal,
);

router.post(
  '/handover/treatment-external-request',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(handoverTransportExternalWasteSchema),
  handoverToTreatmentExternal,
);

router.post(
  '/receiving/treatment-external-request',
  authenticate,
  rateLimitter,
  authorizeRoles(onlyAdmin),
  validateRequest(handoverTreatmentWasteSchema),
  receievmentUpToTreatmentExternal,
);

export default router;
