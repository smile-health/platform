import express from 'express';
import { authenticate } from '../../middlewares/authorization';
import rateLimitter from '../../middlewares/rateLimitter';
import { authorizeRoles, allRead, onlyAdmin } from '../../middlewares/authorizeRoles';
import { validateRequest } from '../../middlewares/validateRequest';
import { getDataHomePage, getDetailDataHomePage } from '../../controllers/mobile/homepageController';
import { mobileHomepageSchema } from '../../request-schemas/homepage.schema';

const router = express.Router();

router.get(
    '/waste-bag-details/:wasteId',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getDetailDataHomePage,
);

router.get(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    validateRequest(mobileHomepageSchema),
    getDataHomePage,
);


export default router;
