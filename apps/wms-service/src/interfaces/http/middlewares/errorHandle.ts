import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// Define custom error interface
interface AppError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}

// Error handling middleware
export const errorHandler: ErrorRequestHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    console.error('Global error handler:', error);

    const isDevelopment = process.env.NODE_ENV === 'development';

    // Pastikan server tidak crash
    res.status(error.statusCode || 500).json({
        status: error.status || 'fail',
        message: req.t("common.server-error"),
        error: isDevelopment ? error.message : 'Something went wrong',
        stack: isDevelopment ? error.stack : undefined,
        timestamp: new Date().toISOString(),
    });
};

// 404 handler middleware
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error: AppError = new Error(`Not found - ${req.originalUrl}`);
    error.statusCode = 404;
    error.status = 'fail';
    next(error);
};

// Process event handlers untuk mencegah crash
export const registerProcessHandlers = (): void => {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
        console.error('Uncaught Exception:', error);
        // Jangan exit process, biarkan server tetap running
        // Tapi log error dengan detail
        console.log('Server continues running despite uncaught exception');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);

        // Convert reason to Error untuk logging yang lebih baik
        const error = reason instanceof Error ? reason : new Error(String(reason));
        console.error('Unhandled Rejection Error:', error);

        // Jangan exit process
        console.log('Server continues running despite unhandled rejection');
    });

    // Handle SIGTERM untuk graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully...');
        // Tambahkan cleanup logic di sini jika needed
        process.exit(0);
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
        console.log('SIGINT received. Shutting down gracefully...');
        // Tambahkan cleanup logic di sini jika needed
        process.exit(0);
    });
};
