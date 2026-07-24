import { Router } from 'express';
import { setAuthController } from '../../controllers/authController';
import wasteRoutes from './wasteRoutes';
import distanceLimitRoutes from './distanceLimitRoutes';
import disposalRoutes from './disposalRoutes';
import homepageRoutes from './homepageRoutes';
import scanQrRoutes from './scanQrRoutes';
import enterWeightRoutes from './enterWeightRoutes';

export const v1RouterMobile = Router();

v1RouterMobile.get('/set-auth', setAuthController);

v1RouterMobile.use('/waste', wasteRoutes);
v1RouterMobile.use('/validate', distanceLimitRoutes);
v1RouterMobile.use('/disposal', disposalRoutes);
v1RouterMobile.use('/homepage', homepageRoutes);
v1RouterMobile.use('/scan-qr-code', scanQrRoutes);
v1RouterMobile.use('/enter-weight', enterWeightRoutes);
