import express from 'express';
import path from 'path';
import cors from 'cors';
import jsonResponse from './interfaces/http/middlewares/jsonResponse';
import i18nMiddleware from './interfaces/http/middlewares/i18n';
import { deviceInfoMiddleware } from './interfaces/http/middlewares/deviceInfo';
import { v1Router } from './interfaces/http/routes/index';
import { v1RouterMobile } from './interfaces/http/routes/mobile/index';
import { boot } from './boot/boot';
import { bootstrap } from './boot/bootstrap';
import {
    errorHandler,
    notFoundHandler,
    registerProcessHandlers,
} from './interfaces/http/middlewares/errorHandle';

const app = express();

const allowedOrigins = [process.env.ALLOWED_HOST ?? '*'];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'accept',
            'accept-language',
            'device-type',
            'x-device-info',
            'sec-ch-ua',
            'sec-ch-ua-mobile',
            'sec-ch-ua-platform',
            'timezone',
            'Referer',
        ],
        exposedHeaders: ['*'],
    }),
);

app.get(
    '/error',
    (req: express.Request, res: express.Response, next: express.NextFunction): void => {
        try {
            // Simulasi error
            throw new Error('This is a test error ' + 400);
        } catch (error) {
            next(error);
        }
    },
);

// Contoh route dengan async error
app.get(
    '/async-error',
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<void> => {
        try {
            // Simulasi async error
            throw new Error('This is an async test error ' + 500);
        } catch (error) {
            next(error);
        }
    },
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(jsonResponse);
app.use(deviceInfoMiddleware);
app.use(i18nMiddleware);

app.get('/', async (req, res) => {
    try {
        console.log('[APP] Starting boot process...');
        // const bootResult = await boot();

        console.log('[APP] Starting bootstrap process...');
        // const bootstrapResult = await bootstrap();

        console.log('[APP] Application started successfully');
        res.status(200).json({
            status: 'success',
            message: 'Service WMS API Successfully',
            details: {
                // boot: bootResult,
                // bootstrap: bootstrapResult,
            },
        });
    } catch (error: any) {
        const errorSource = error.message.includes('BOOT') ? 'boot' : 'bootstrap';
        if (!res.headersSent) {
            res.status(500).json({
                status: 'fail',
                message: 'Service WMS API Error',
                error: {
                    source: errorSource,
                    message: error.message,
                    timestamp: new Date().toISOString(),
                },
            });
        }
    }
});

app.get('/boot', async (req, res) => {
    try {
        console.log('[APP] Starting boot process...');
        const bootResult = await boot();

        console.log('[APP] Starting bootstrap process...');
        const bootstrapResult = await bootstrap();

        console.log('[APP] Application started successfully');
        res.status(200).json({
            status: 'success',
            message: 'Service WMS API Successfully',
            details: {
                boot: bootResult,
                bootstrap: bootstrapResult,
            },
        });
    } catch (error: any) {
        const errorSource = error.message.includes('BOOT') ? 'boot' : 'bootstrap';
        if (!res.headersSent) {
            res.status(500).json({
                status: 'fail',
                message: 'Service WMS API Error',
                error: {
                    source: errorSource,
                    message: error.message,
                    timestamp: new Date().toISOString(),
                },
            });
        }
    }
});

app.use('/api/v1', v1Router);
app.use('/api/v1/mobile', v1RouterMobile);

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, './../docs/redoc.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);
registerProcessHandlers();

export default app;
