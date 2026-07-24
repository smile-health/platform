import UserFcmTokenRepository from './UserFcmTokenRepositoryImpl';
import UserFcmToken from '../../../domain/entities/UserFcmToken';
import { UniqueConstraintError, Op } from 'sequelize';
import UserFcmTokenModel from '../models/UserFcmTokenModel';

export default class UserFcmTokenRepositoryImpl implements UserFcmTokenRepository {
    async createOrUpdateToken(data: UserFcmToken): Promise<UserFcmToken> {
        try {
            const existingToken = await UserFcmTokenModel.findOne({
                where: {
                    [Op.and]: [
                        { userUuid: data.userUuid },
                        { userId: data.userId },
                        { entityId: data.entityId },
                    ],
                },
            });

            if (existingToken) {
                // Update existing token
                existingToken.set('token', data.token);
                existingToken.set('updatedAt', new Date());
                await existingToken.save();
                return handleModel(existingToken);
            } else {
                const newToken = await UserFcmTokenModel.create({
                    userId: data.userId,
                    entityId: data.entityId,
                    userUuid: data.userUuid,
                    token: data.token,
                });

                return handleModel(newToken);
            }
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Data get failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error get Data: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while get Data');
            }
        }
    }
    async getTokenByUserId(id: string, entityId: number): Promise<UserFcmToken | null> {
        try {
            const tokenModel = await UserFcmTokenModel.findOne({
                where: {
                    [Op.or]: [{ userUuid: id }, { userId: id }],
                    entityId,
                },
            });

            if (!tokenModel) {
                return null;
            }

            return handleModel(tokenModel);
        } catch (error) {
            console.error('Error create or update fcm token:', error);
            throw new Error('Error create or update fcm token');
        }
    }
}

function handleModel(model: UserFcmTokenModel): UserFcmToken {
    const result = model.get({ plain: true });

    return new UserFcmToken({
        id: result.id || model.id,
        userId: result.userId,
        entityId: result.entityId,
        userUuid: result.userUuid,
        token: result.token,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
    });
}
