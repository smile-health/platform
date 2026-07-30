import { NextFunction, Request, Response } from 'express';
import {
    ErrorResponseOptions,
    FailedResponseOptions,
    SuccessOptions,
} from '../../../shared/types/express';
const enum Status {
    success = 'success',
    fail = 'fail',
    error = 'error',
}

type jsonResponseData = {
    status: keyof typeof Status;
    data?: any;
    message?: string | unknown;
};

export default (req: Request, res: Response, next: NextFunction) => {
    res.success = (data: any, option?: SuccessOptions) => {
        const resObj: jsonResponseData & Record<string, any> = {
            status: Status.success,
            data,
        };
        if (option?.pagination) {
            resObj[option.paginationKey ?? 'pagination'] = option.pagination;
        }
        if (option && option.statusCode) {
            return res.status(option.statusCode).json(resObj);
        }
        return res.status(200).json(resObj);
    };

    res.fail = (data: any, option?: FailedResponseOptions) => {
        const resObj: jsonResponseData = {
            status: Status.fail,
            data,
        };
        if (option) {
            if (option.isValidationError) {
                return res.status(422).json(resObj);
            } else if (option.isNotFoundError) {
                return res.status(404).json(resObj);
            } else if (option.isUnauthorizedError) {
                return res.status(401).json(resObj);
            } else if (option.isForbiddenError) {
                return res.status(403).json(resObj);
            } else if (option.isRateLimitError) {
                return res.status(429).json(resObj);
            } else if (option.statusCode) {
                return res.status(option.statusCode).json(resObj);
            }
        }
        return res.status(400).json(resObj);
    };

    res.error = (error: Error | string | unknown, option?: ErrorResponseOptions) => {
        const resObj: jsonResponseData & Record<string, any> = {
            status: Status.error,
            message: error instanceof Error ? error.message : error,
            data:
                error instanceof Error
                    ? { name: error.name, message: error.message, stack: error.stack }
                    : error,
        };
        console.error(error);
        if (option) {
            if (option.isInternalServerError) {
                return res.status(500).json(resObj);
            }
            return res.status(500).json(resObj);
        }
        return res.status(500).json(resObj);
    };

    next();
};
