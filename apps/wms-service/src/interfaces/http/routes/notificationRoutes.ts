import { Router } from 'express';
import rateLimitter from '../middlewares/rateLimitter';
import { authenticate } from '../middlewares/authorization';
import { authorizeRoles, allRead, onlyAdminHF } from '../middlewares/authorizeRoles';
import {
  getAllNotif,
  getTotalCount,
  markAsRead,
  markAllRead,
  triggerInactiveUserNotification,
  triggerEmailInactiveUserNotification,
  triggerMaximumTemporaryStorageNotification,
  triggerWasteGenerationBelowMonthlyProjectionNotification,
  triggerUpdateStatusManualWeighingApprovalNotification,
  getTypeNotif,
} from '../controllers/notificationController';

const router = Router();

router.get('/', authenticate, rateLimitter, authorizeRoles(allRead), getAllNotif);
router.get('/type', authenticate, rateLimitter, authorizeRoles(allRead), getTypeNotif);
router.get('/count', authenticate, rateLimitter, authorizeRoles(allRead), getTotalCount);
router.patch('/:id/read', authenticate, rateLimitter, authorizeRoles(allRead), markAsRead);
router.patch('/read', authenticate, rateLimitter, authorizeRoles(allRead), markAllRead);
router.post(
  '/trigger-inactive-user',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  triggerInactiveUserNotification,
);

router.post(
  '/trigger-email-inactive-user',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  triggerEmailInactiveUserNotification,
);

router.post(
  '/trigger-maximum-temporary-storage',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  triggerMaximumTemporaryStorageNotification,
);

router.post(
  '/trigger-waste-generation-below-monthly-projection',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  triggerWasteGenerationBelowMonthlyProjectionNotification,
);

router.post(
  '/trigger-update-status-manual-weighing-approval',
  authenticate,
  rateLimitter,
  authorizeRoles(allRead),
  triggerUpdateStatusManualWeighingApprovalNotification,
);

export default router;
