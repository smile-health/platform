import { Request, Response } from 'express';
import { UserTokenServiceImpl } from '../../../infrastructure/cache/repositories/UserCache';
import { CheckToken } from '../../../application/use-cases/CheckToken';
import { CheckUserInfo } from '../../../application/use-cases/CheckUserInfo';
import { DeleteUserToken } from '../../../application/use-cases/DeleteUserToken';
import handleValidateToken from '../../../shared/utils/handleValidateToken';

export async function setAuthController(req: Request, res: Response): Promise<void> {
  try {
    const token = req.headers?.['authorization']?.split(' ')[1] ?? (req.query?.token as string) ?? null;

    if (!token) {
      res.fail(req.t('common.validate-token'), {
        isValidationError: true,
      });
      return;
    }

    const repo = new UserTokenServiceImpl();
    const useCaseDeleteToken = new DeleteUserToken(repo);
    const useCaseToken = new CheckToken(repo);
    const useCaseUser = new CheckUserInfo(repo);

    // delete token and user info if exist
    await useCaseDeleteToken.execute({
      token: token?.toString(),
    });
    await useCaseDeleteToken.executeUserInfo({
      token: token?.toString(),
    });

    const userInfo = await handleValidateToken(token?.toString() ?? '');

    if (userInfo === null) {
      res.fail(req.t('common.validate-token'), {
        isUnauthorizedError: true,
      });
      return;
    }
    // cachce token
    await useCaseToken.executeCache({
      token: token?.toString(),
      ttl: Number(process.env.EXPIRED_TOKEN),
    });

    // cachce user info using key index 1 from token
    await useCaseUser.cacheUserInfo({
      token: token?.toString(),
      userInfo: userInfo,
      ttl: Number(process.env.EXPIRED_TOKEN),
    });

    res.success(userInfo);
  } catch (error) {
    res.error(error);
  }
}
