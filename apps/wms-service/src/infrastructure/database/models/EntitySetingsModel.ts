import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface EntitySettingsAttributes {
    id?: number;
    createdBy: string;
    updatedBy: string;
    entityId: number;
    settingName: string;
    settingValue: string;
    created_at?: Date;
    updated_at?: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface EntitySettingsCreationAttributes extends Optional<EntitySettingsAttributes, 'id'> {}

export class EntitySettingsModel extends Model<
    EntitySettingsAttributes,
    EntitySettingsCreationAttributes
> {
    id?: number;
    createdBy!: string;
    updatedBy!: string;
    entityId!: number;
    settingName!: string;
    settingValue!: string;
    created_at?: Date;
    updated_at?: Date;
}

EntitySettingsModel.init(
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
        entityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'entity_id',
        },
        settingName: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: 'setting_name',
        },
        settingValue: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'setting_value',
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
        tableName: 'entity_settings',
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
                name: 'entity_setting_unique',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'entity_id' }, { name: 'setting_name' }],
            },
        ],
    },
);

export default EntitySettingsModel;
