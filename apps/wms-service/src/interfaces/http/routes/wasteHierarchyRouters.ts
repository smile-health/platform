import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import {
    createWasteHierarchy,
    deleteWasteHierarchy,
    explanationOfWasteClassification,
    getAllWasteHierarchy,
    getWasteHierarchyById,
    getWasteHierarchyByParentHierarchyId,
    updateWasteHierarchy,
} from '../controllers/wasteHierarchyController';
import { createWasteHierarchySchema } from '../request-schemas/createWasteHierarchy.schema';
import { validateRequest } from '../middlewares/validateRequest';
import { updateWasteHierarchySchema } from '../request-schemas/updateWasteHierarchy.schema';
import {
    authorizeRoles,
    onlySuperAdmin,
    allRead,
    allGovernment,
} from '../middlewares/authorizeRoles';

const wasteHierarchyRoutes = Router();

wasteHierarchyRoutes.post(
    '/',
    authenticate,
    rateLimitter,
    authorizeRoles(onlySuperAdmin),
    validateRequest(createWasteHierarchySchema),
    createWasteHierarchy,
);
wasteHierarchyRoutes.get(
    '',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllWasteHierarchy,
);
wasteHierarchyRoutes.get(
    '/parent-hierarchy',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getWasteHierarchyByParentHierarchyId,
);

wasteHierarchyRoutes.get(
    '/explanation-waste-classification',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    explanationOfWasteClassification,
);
wasteHierarchyRoutes
    .route('/:id')
    .get(authenticate, rateLimitter, authorizeRoles(allRead), getWasteHierarchyById)
    .put(
        authenticate,
        rateLimitter,
        authorizeRoles(onlySuperAdmin),
        validateRequest(updateWasteHierarchySchema),
        updateWasteHierarchy,
    )
    .delete(authenticate, rateLimitter, authorizeRoles(onlySuperAdmin), deleteWasteHierarchy);

export default wasteHierarchyRoutes;
