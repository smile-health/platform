import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import { getAllWasteBagAuditTrail } from '../controllers/wasteBagAuditTrailController';

const wasteBagAuditTrailRoutes = Router();

wasteBagAuditTrailRoutes.get('', authenticate, rateLimitter, getAllWasteBagAuditTrail);

export default wasteBagAuditTrailRoutes;
