// Custom error class untuk aplikasi
export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);

        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Factory function untuk membuat error
export const createError = (message: string, statusCode: number = 500): AppError => {
    return new AppError(message, statusCode);
};
