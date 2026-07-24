import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface RegionAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    regionType: 'COUNTRY' | 'PROVINCE/STATE' | 'CITY' | 'DISTRICT' | 'SUB-DISTRICT' | 'VILLAGE';
    parentId?: number;
    code: string;
    name: string;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface RegionCreationAttributes extends Optional<RegionAttributes, 'id'> {}

export class RegionModel extends Model<RegionAttributes, RegionCreationAttributes> {}

RegionModel.init(
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
        regionType: {
            type: DataTypes.ENUM(
                'COUNTRY',
                'PROVINCE/STATE',
                'CITY',
                'DISTRICT',
                'SUB-DISTRICT',
                'VILLAGE',
            ),
            allowNull: false,
            defaultValue: 'COUNTRY',
            field: 'region_type',
        },
        parentId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: 'parent_id',
        },
        code: {
            type: DataTypes.STRING(16),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(32),
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
        sequelize,
        tableName: 'region',
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
                name: 'parent_id',
                using: 'BTREE',
                fields: [{ name: 'parent_id' }],
            },
        ],
    },
);
