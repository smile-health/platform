import { Request, Response, NextFunction } from 'express';
import handleValidateToken from './../../../shared/utils/handleValidateToken';
import { UserTokenServiceImpl } from '../../../infrastructure/cache/repositories/UserCache';
import { CheckToken } from '../../../application/use-cases/CheckToken';
import { CheckUserInfo } from '../../../application/use-cases/CheckUserInfo';
import { DeleteUserToken } from '../../../application/use-cases/DeleteUserToken';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.fail(req.t('common.missing-token'), {
            isValidationError: true,
        });
        return;
    }

    const token = authHeader?.split(' ')[1];
    if (!token) {
        res.fail('Token not valid', {
            isValidationError: true,
        });
        return;
    }
    try {
        const repo = new UserTokenServiceImpl();
        const useCaseToken = new CheckToken(repo);
        const useCaseUser = new CheckUserInfo(repo);
        const useCaseDelete = new DeleteUserToken(repo);

        const existingTokenTTL = await useCaseToken.execute({ token });

        // If token exists and is still valid, skip validation
        if (existingTokenTTL > 0) {
            const userInfo = await useCaseUser.execute({ token });
            if (!userInfo) {
                res.fail('User info not found', { isForbiddenError: true });
                return;
            }
            req.user = userInfo;
            return next();
        }

        // Only validate if token is expired/missing
        if (existingTokenTTL === 0) {
            await useCaseDelete.execute({ token });
        }

        const result = await handleValidateToken(token);
        if (result === null) {
            await useCaseDelete.executeUserInfo({ token });
            res.fail('Invalid or expired token', { isUnauthorizedError: true });
            return;
        }

        // Cache new token and user info
        await Promise.all([
            useCaseToken.executeCache({
                token,
                ttl: Number(process.env.EXPIRED_TOKEN),
            }),
            useCaseUser.cacheUserInfo({
                token,
                userInfo: result,
                ttl: Number(process.env.EXPIRED_TOKEN),
            }),
        ]);

        req.user = result;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.error('Authentication failed:' + error);
        return;
    }
}
