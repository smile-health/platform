import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface PartnerVehicleAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
    entityId: number;
    vehicleType:
        | 'BOX_TRUCK'
        | 'REFRIGERATED_BOX_TRUCK'
        | 'OPEN_BODY_TRUCK'
        | 'TANKER'
        | 'HAZARDOUS_MATERIAL_TRUCK'
        | 'RADIOACTIVE_MATERIAL_TRUCK'
        | 'FLATBED_TRUCK'
        | 'LOADER_TRUCK'
        | 'TRAILER'
        | 'VAN';
    vehicleNumber: string;
    capacityInKgs: number;
    transporterId?: number;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface PartnerVehicleCreationAttributes extends Optional<PartnerVehicleAttributes, 'id'> {}

export class PartnerVehicleModel extends Model<
    PartnerVehicleAttributes,
    PartnerVehicleCreationAttributes
> {}

PartnerVehicleModel.init(
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
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'entity_id',
        },
        vehicleType: {
            type: DataTypes.ENUM(
                'BOX_TRUCK',
                'REFRIGERATED_BOX_TRUCK',
                'OPEN_BODY_TRUCK',
                'TANKER',
                'HAZARDOUS_MATERIAL_TRUCK',
                'RADIOACTIVE_MATERIAL_TRUCK',
                'FLATBED_TRUCK',
                'LOADER_TRUCK',
                'TRAILER',
                'VAN',
            ),
            allowNull: false,
            field: 'vehicle_type',
        },
        vehicleNumber: {
            type: DataTypes.STRING(16),
            allowNull: false,
            unique: 'Unique Vehicle Number',
            field: 'vehicle_number',
        },
        capacityInKgs: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: 'capacity_in_kgs',
        },
        transporterId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'transporter_id',
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
        tableName: 'partner_vehicle',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
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
                name: 'Unique Vehicle Number',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'vehicle_number' }],
            },
        ],
    },
);
