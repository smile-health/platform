import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface GlobalSettingsAttributes {
    id?: number;
    created_by: string;
    updated_by: string;
    setting_name: string;
    setting_value: string;
    created_at?: Date;
    updated_at?: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface GlobalSettingsCreationAttributes extends Optional<GlobalSettingsAttributes, 'id'> {}

export class GlobalSettingsModel extends Model<
    GlobalSettingsAttributes,
    GlobalSettingsCreationAttributes
> {
    id?: number;
    created_by!: string;
    updated_by!: string;
    setting_name!: string;
    setting_value!: string;
    created_at?: Date;
    updated_at?: Date;
}

GlobalSettingsModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        created_by: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        setting_name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        setting_value: {
            type: DataTypes.STRING(255),
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
        tableName: 'global_settings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        paranoid: true,
        deletedAt: 'deleted_at',
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
            {
                name: 'setting_name_unique',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'setting_name' }],
            },
        ],
    },
);

export default GlobalSettingsModel;
