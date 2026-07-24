import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface UserRoleAttributes {
    id?: number;
    userId: number;
    entityId: number;
    userUuid: string;
    token: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface UserRoleCreationAttributes extends Optional<UserRoleAttributes, 'id'> {}

export class UserFcmTokenModel
    extends Model<UserRoleAttributes, UserRoleCreationAttributes>
    implements UserRoleAttributes
{
    id?: number;
    userId!: number;
    entityId!: number;
    userUuid!: string;
    token!: string;
    createdAt?: Date;
    updatedAt?: Date;
}

UserFcmTokenModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
        },
        entityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'entity_id',
        },
        userUuid: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'user_uuid',
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'token',
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at',
        },
        deletedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'deleted_by',
        },
    },
    {
        sequelize,
        tableName: 'user_fcm_token',
        paranoid: true,
        deletedAt: 'deleted_at',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
            {
                name: 'idx_user_uuid',
                using: 'BTREE',
                fields: [{ name: 'user_uuid' }],
            },
            {
                name: 'idx_user_id',
                using: 'BTREE',
                fields: [{ name: 'user_id' }],
            },
        ],
    },
);

export default UserFcmTokenModel;
