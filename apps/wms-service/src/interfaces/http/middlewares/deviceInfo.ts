import { Request, Response, NextFunction } from 'express';
import { DeviceInfo } from '../../../shared/types/userInfo';

export const deviceInfoMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const deviceInfoHeader = req.headers['x-device-info'] as string;

        if (deviceInfoHeader) {
            try {
                // Parse JSON device info from header
                const parsedDeviceInfo: DeviceInfo = JSON.parse(deviceInfoHeader);
                req.deviceInfo = parsedDeviceInfo;
            } catch (parseError) {
                console.warn('Failed to parse x-device-info header:', parseError);
                // Fallback to basic device info from user-agent
                req.deviceInfo = {
                    userAgent: req.headers['user-agent'],
                    deviceType: 'web', // default fallback
                };
            }
        } else {
            // Fallback: create basic device info from existing headers
            const deviceType = req.headers['device-type'] as string;
            req.deviceInfo = {
                deviceType: (deviceType as 'mobile' | 'web' | 'tablet') || 'web',
                userAgent: req.headers['user-agent'],
            };
        }

        next();
    } catch (error) {
        console.error('Error in deviceInfoMiddleware:', error);
        // Continue without device info rather than blocking request
        req.deviceInfo = {
            deviceType: 'web',
            userAgent: req.headers['user-agent'],
        };
        next();
    }
};
