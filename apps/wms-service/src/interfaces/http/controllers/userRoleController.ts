import { Request, Response } from 'express';
import UserRoleRepositoryImpl from '../../../infrastructure/database/repositories/UserRoleRepositoryImpl';
import GetUserRole from '../../../application/use-cases/user-role/GetUserRole';

export async function getAllUserRole(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search } = req.query;
        const repo = new UserRoleRepositoryImpl();
        const useCase = new GetUserRole(repo);

        const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
        const lang = acceptLanguage.includes('en') ? 'en' : 'id';

        return await useCase
            .executeAll(Number(limit?.toString()), Number(page?.toString()), search?.toString(), lang)
            .then((data) => {
                const result = data.data.map(item => {
                    return {
                        ...item,
                        name_id: req.t(`roles.id.${item.type}`),
                        name_en: req.t(`roles.en.${item.type}`)
                    }
                })
                res.success({
                    data: data.data,
                    pagination: data.pagination
                });
            })
            .catch((error) => {
                console.error('Error retrieving User Role:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t("common.server-error"));
                }
            });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}
