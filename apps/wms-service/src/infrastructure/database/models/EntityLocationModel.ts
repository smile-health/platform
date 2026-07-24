import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import EntitiesModel from './EntitiesModel';

export interface EntityLocationAttributes {
    id?: number;
    createdBy: string;
    updatedBy: string;
    created_at?: Date;
    updated_at?: Date;
    entityId: number;
    locationName: string;
    latitude: number;
    longitude: number;
    distanceLimitInMeters?: number;
    address?: string;
    provinceId?: number;
    cityId?: number;
    provinceName?: string;
    cityName?: string;
    locationType?: 'STORAGE' | 'TREATMENT';
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface EntityLocationCreationAttributes extends Optional<EntityLocationAttributes, 'id'> {}

export class EntityLocationModel extends Model<
    EntityLocationAttributes,
    EntityLocationCreationAttributes
> {
    id?: number;
    createdBy!: string;
    updatedBy!: string;
    created_at?: Date;
    updated_at?: Date;
    entityId!: number;
    locationName!: string;
    latitude!: number;
    longitude!: number;
    distanceLimitInMeters?: number;
    address?: string;
    provinceId?: number;
    cityId?: number;
    provinceName?: string;
    cityName?: string;
    locationType?: 'STORAGE' | 'TREATMENT';
}

EntityLocationModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
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
            allowNull: true,
            field: 'updated_by',
        },
        entityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'entity_id',
        },
        locationName: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: 'location_name',
        },
        latitude: {
            type: DataTypes.FLOAT(10, 6),
            allowNull: false,
        },
        longitude: {
            type: DataTypes.FLOAT(10, 6),
            allowNull: false,
        },
        distanceLimitInMeters: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: 'distance_limit_in_meters',
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        provinceId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'province_id',
        },
        cityId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'city_id',
        },
        provinceName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'province_name',
        },
        cityName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'city_name',
        },
        locationType: {
            type: DataTypes.ENUM('STORAGE', 'TREATMENT'),
            allowNull: false,
            field: 'location_type',
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
        tableName: 'entity_location',
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
                name: 'entity_id_index',
                using: 'BTREE',
                fields: [{ name: 'entity_id' }],
            },
            {
                name: 'location_name_index',
                using: 'BTREE',
                fields: [{ name: 'location_name' }],
            },
            {
                name: 'province_id_index',
                using: 'BTREE',
                fields: [{ name: 'province_id' }],
            },
            {
                name: 'city_id_index',
                using: 'BTREE',
                fields: [{ name: 'city_id' }],
            },
        ],
    },
);

EntityLocationModel.belongsTo(EntitiesModel, {
    foreignKey: 'entity_id',
    as: 'entities',
});

export default EntityLocationModel;
