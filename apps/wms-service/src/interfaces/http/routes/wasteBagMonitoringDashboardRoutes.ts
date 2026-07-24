import { Router } from 'express';
import rateLimitter from '../middlewares/rateLimitter';
import { authenticate } from '../middlewares/authorization';
import { allRead, authorizeRoles } from '../middlewares/authorizeRoles';
import {
    getMonthlyWasteBagSummaryChart,
    getProvinceWasteBagSummaryChart,
    getRegencyWasteBagSummaryChart,
    getEntityWasteBagSummaryChart,
    getEntityWasteBagSummaryByGroup,
    getEntityWasteBagSummaryByCharacteristics,
    getWasteCharacteristicsSummaryChart,
    getWasteGroupSummaryChart,
    getEntityWasteBagSummaryByCharacteristicsExport,
} from '../controllers/wasteBagMonitoringDashboardController';

const routes = Router();

routes.get(
    '/waste-group-summary-chart',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteGroupSummaryChart,
);

routes.get(
    '/waste-characteristics-summary-chart',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteCharacteristicsSummaryChart,
);

routes.get(
    '/monthly-waste-bag-summary-chart',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getMonthlyWasteBagSummaryChart,
);

routes.get(
    '/province-waste-bag-summary-chart',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getProvinceWasteBagSummaryChart,
);

routes.get(
    '/regency-waste-bag-summary-chart',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getRegencyWasteBagSummaryChart,
);

routes.get(
    '/entity-waste-bag-summary-chart',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getEntityWasteBagSummaryChart,
);

routes.get(
    '/entity-waste-bag-summary-by-group',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getEntityWasteBagSummaryByGroup,
);

routes.get(
    '/entity-waste-bag-summary-by-characteristics',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getEntityWasteBagSummaryByCharacteristics,
);

routes.get(
    '/entity-waste-bag-summary-by-characteristics/export',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getEntityWasteBagSummaryByCharacteristicsExport,
);
export default routes;
