import { Router } from 'express';
import { authenticate } from '../middlewares/authorization';
import rateLimitter from '../middlewares/rateLimitter';
import { authorizeRoles, allRead } from '../middlewares/authorizeRoles';
import { manifestInMemory } from '../middlewares/fileUpload';
import { getAllSpeedEntities, getSpeedEntityByNib } from '../controllers/speedEntityController';
import {
    getAllSpeedWaste,
    getSpeedWasteById,
    getSpeedWasteAggregate,
} from '../controllers/speedWasteController';
import {
    getAllSpeedTransportGroups,
    getSpeedTransportGroupByCode,
    getAllSpeedOperators,
    getAllSpeedTreatmentProviders,
    handoverSpeedTransport,
    handoverSpeedTreatment,
} from '../controllers/speedHandoverController';

const speedRoutes = Router();

speedRoutes.get('/entitas', authenticate, rateLimitter, authorizeRoles(allRead), getAllSpeedEntities);
speedRoutes.get(
    '/entitas/:nib',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getSpeedEntityByNib,
);

speedRoutes.get('/limbah', authenticate, rateLimitter, authorizeRoles(allRead), getAllSpeedWaste);
// Must be registered BEFORE '/limbah/:id' — otherwise Express would match "agregat" as :id.
speedRoutes.get(
    '/limbah/agregat',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getSpeedWasteAggregate,
);
speedRoutes.get(
    '/limbah/:kode_kantong_limbah',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getSpeedWasteById,
);

speedRoutes.get(
    '/grup-pengangkutan',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllSpeedTransportGroups,
);
// Must be registered BEFORE '/grup-pengangkutan/:kode_grup_pengangkutan' for the same reason as
// '/limbah/agregat' above.
speedRoutes.get(
    '/grup-pengangkutan/:kode_grup_pengangkutan',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getSpeedTransportGroupByCode,
);
speedRoutes.get('/operator', authenticate, rateLimitter, authorizeRoles(allRead), getAllSpeedOperators);
speedRoutes.get(
    '/pengolah',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    getAllSpeedTreatmentProviders,
);

speedRoutes.post(
    '/limbah/serah-terima-pengangkutan',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    manifestInMemory.single('berkas_manifest'),
    handoverSpeedTransport,
);
speedRoutes.post(
    '/limbah/serah-terima-pengolahan',
    authenticate,
    rateLimitter,
    authorizeRoles(allRead),
    handoverSpeedTreatment,
);

export default speedRoutes;
