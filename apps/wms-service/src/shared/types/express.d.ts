import 'express';

export type SuccessStatusCode = 200 | 201 | 202 | 204;
export type ClientErrorStatusCode = 400 | 401 | 403 | 404 | 409;
export type ServerErrorStatusCode = 500 | 502 | 503 | 504;

export type SuccessOptions = {
    statusCode?: SuccessStatusCode;
    message?: string;
    error?: string | null;
    warning?: string | null;
    pagination?: Record<string, number>;
    // Body key to use for `pagination` — defaults to 'pagination'. Lets a caller (e.g. SPEED's
    // Indonesian-named responses) send the same data under a different top-level key without
    // affecting any other caller that doesn't set this.
    paginationKey?: string;
};

export type FailedResponseOptions = {
    isValidationError?: boolean;
    isNotFoundError?: boolean;
    isUnauthorizedError?: boolean;
    isForbiddenError?: boolean;
    isRateLimitError?: boolean;
    statusCode?: ClientErrorStatusCode;
    message?: string;
};

export type ErrorResponseOptions = {
    isInternalServerError?: boolean;
    statusCode?: ServerErrorStatusCode;
    message?: string;
};

declare module 'express-serve-static-core' {
    interface Response {
        success: (data: any, option?: SuccessOptions) => Response;
        fail: (data: any, option?: FailedResponseOptions) => Response;
        error: (
            error: Error | string,
            option?: ErrorResponseOptions,
            data?: any = null,
        ) => Response;
    }
}
