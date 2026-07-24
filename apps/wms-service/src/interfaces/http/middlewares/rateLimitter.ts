import { NextFunction, Request, Response } from 'express';
import { RateLimiterImpl } from '../../../infrastructure/cache/repositories/RateLimiterImpl';
import { CheckRateLimit } from '../../../application/use-cases/CheckRateLimit';
import rateLimitConfig from '../../../config/rate-limit.config';

export default async (req: Request, res: Response, next: NextFunction) => {
    const repo = new RateLimiterImpl();
    const useCase = new CheckRateLimit(repo);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.fail(req.t('common.missing-token'), {
            isValidationError: true,
        });
        return;
    }

    const token = authHeader?.split(' ')[1];

    const TOKEN_PREFIX = token.split('.')[1];

    const isAllowed = await useCase.execute({
        limit: rateLimitConfig.THRESHOLD,
        userId: TOKEN_PREFIX,
        window: rateLimitConfig.WINDOW_IN_SECONDS,
    });

    if (!isAllowed) {
        res.fail(req.t('common.limit'), {
            isRateLimitError: true,
        });
    } else {
        next();
    }
};
