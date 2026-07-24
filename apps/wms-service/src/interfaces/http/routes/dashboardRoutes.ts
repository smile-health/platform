import { Router } from 'express';
import rateLimitter from '../middlewares/rateLimitter';
import { authenticate } from '../middlewares/authorization';
import { allRead, authorizeRoles } from '../middlewares/authorizeRoles';
import {
    getSummaryPerDayController,
    getSummaryWasteHierarchy,
    getSummaryWasteHierarchyByCity,
    getSummaryWasteHierarchyByProvince,
    getWasteCharacteristicsSummaryController,
    getWasteGroupByAdminHealthcareFacility,
    getWasteGroupByTransporter,
    getWasteGroupByTreatment,
    getWasteGroupDetailsByActionController,
} from '../controllers/dashboardController';
import {
    exportActivitySummariesForEntities,
    getActivityManualScaleForEntities,
    getActivitySummariesForEntities,
    getUserActivitySummary
} from '../controllers/dashboardActivityController';

const dashboardRoutes = Router();

dashboardRoutes.get(
    '/waste-hierarchy-summary',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getSummaryWasteHierarchy,
);

dashboardRoutes.get(
    '/provinces/:provinceId/waste-hierarchy-summary',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getSummaryWasteHierarchyByProvince,
);

dashboardRoutes.get(
    '/cities/:cityId/waste-hierarchy-summary',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getSummaryWasteHierarchyByCity,
);

dashboardRoutes.get(
    '/waste-groups/admin-healthcare-facilities',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteGroupByAdminHealthcareFacility,
);

dashboardRoutes.get(
    '/waste-groups/transporter',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteGroupByTransporter,
);

dashboardRoutes.get(
    '/waste-groups/treatment',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteGroupByTreatment,
);

dashboardRoutes.get(
    '/waste-groups-details/:wasteGroupId',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteGroupDetailsByActionController,
);

dashboardRoutes.get(
    '/waste-characteristics-summary',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteCharacteristicsSummaryController,
);

dashboardRoutes.get(
    '/summary-per-day',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getSummaryPerDayController,
);

dashboardRoutes.get(
    '/summary-activity-entities',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getActivitySummariesForEntities,
);

dashboardRoutes.get(
    '/summary-activity-entities/export',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    exportActivitySummariesForEntities,
);

dashboardRoutes.get(
    '/manual-scale-activity-entities',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getActivityManualScaleForEntities,
);

dashboardRoutes.get(
    '/summary-users-activity',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getUserActivitySummary,
);

export default dashboardRoutes;
