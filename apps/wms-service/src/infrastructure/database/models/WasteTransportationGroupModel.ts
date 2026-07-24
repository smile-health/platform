import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import { PartnerVehicleModel } from './PartnerVehicleModel';

export interface WasteTransportationGroupAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    created_at?: Date;
    updated_at?: Date;
    totalBagsCount: number;
    totalWeightInKgs: number;
    transporterVehicleId?: number;
    transporterOperatorId?: string;
    handoverLattitude?: number;
    handoverLongitude?: number;
    transportationStatus: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED';
    handoverTimestamp?: Date;
    wasteBags?: any;
    isReadOnly?: boolean;
    groupId?: string;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface WasteTransportationGroupCreationAttributes
    extends Optional<WasteTransportationGroupAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class WasteTransportationGroupModel
    extends Model<WasteTransportationGroupAttributes, WasteTransportationGroupCreationAttributes>
    implements WasteTransportationGroupAttributes
{
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    created_at?: Date;
    updated_at?: Date;
    totalBagsCount!: number;
    totalWeightInKgs!: number;
    transporterVehicleId?: number;
    transporterOperatorId?: string;
    handoverLattitude?: number;
    handoverLongitude?: number;
    transportationStatus!: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED';
    handoverTimestamp?: Date;
    wasteBags?: any;
    isReadOnly?: boolean;
    groupId?: string;
}

WasteTransportationGroupModel.init(
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
            allowNull: false,
            field: 'updated_by',
        },
        totalBagsCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: 'total_bags_count',
        },
        totalWeightInKgs: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'total_weight_in_kgs',
        },
        transporterVehicleId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: 'transporter_vehicle_id',
        },
        transporterOperatorId: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'transporter_operator_id',
        },
        handoverLattitude: {
            type: DataTypes.FLOAT(10, 6),
            allowNull: true,
            field: 'handover_lattitude',
        },
        handoverLongitude: {
            type: DataTypes.FLOAT(10, 6),
            allowNull: true,
            field: 'handover_longitude',
        },
        transportationStatus: {
            type: DataTypes.ENUM('READY_FOR_TRANSPORT', 'TRANSPORTATION_REQUEST_CREATED'),
            allowNull: false,
            defaultValue: 'READY_FOR_TRANSPORT',
            field: 'transportation_status',
        },
        handoverTimestamp: {
            type: DataTypes.DATE(3),
            allowNull: true,
            defaultValue: null,
            field: 'handover_timestamp',
        },
        isReadOnly: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_read_only',
        },
        groupId: {
            type: DataTypes.STRING(36),
            allowNull: false,
            defaultValue: false,
            field: 'group_id',
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
        tableName: 'waste_transportation_group',
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
        ],
        hooks: {
            afterCreate: async (instance) => {
                if (!instance.id) {
                    await instance.reload();
                }
            },
        },
    },
);

// WasteTransportationGroupModel.belongsTo(PartnerVehicleModel, {
//     foreignKey: 'transporter_vehicle_id',
//     as: 'vehicleDetail',
// });

// PartnerVehicleModel.hasMany(WasteTransportationGroupModel, {
//     foreignKey: 'transporter_vehicle_id',
//     as: 'vehicleDetails',
// });

export default WasteTransportationGroupModel;
