import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface UserRoleAttributes {
    id?: number;
    updatedBy: string;
    createdBy: string;
    name: string;
    nameEn: string;
    description?: string;
    type: string;
    createdAt?: Date;
    updatedAt?: Date;
    regionId?: number;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface UserRoleCreationAttributes extends Optional<UserRoleAttributes, 'id'> {}

export class UserRoleModel extends Model<UserRoleAttributes, UserRoleCreationAttributes> {}

UserRoleModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        createdBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'created_by',
        },
        updatedBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'updated_by',
        },
        regionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'region_id',
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        nameEn: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: 'name_en',
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING(64),
            allowNull: false,
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
        tableName: 'user_role',
        paranoid: true,
        deletedAt: 'deleted_at',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
        ],
    },
);

export default UserRoleModel;
