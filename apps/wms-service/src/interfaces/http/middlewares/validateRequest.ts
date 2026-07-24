import { ZodSchema } from 'zod';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export const validateRequest = (schema: ZodSchema): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = schema.safeParse({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            if (!result.success) {
                const errors = JSON.parse(result.error?.toString() as string);
                res.fail(errors, {
                    isValidationError: true,
                });
                return;
            }

            req.body = result.data.body;

            next();
        } catch (error) {
            console.error('Error in validating request:', error);
            if (error instanceof Error) {
                res.error(error);
            } else {
                res.error(req.t("common.server-error"));
            }
        }
    };
};
