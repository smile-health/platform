import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import PartnershipModel from './PartnershipModel';
import { PartnerVehicleModel } from './PartnerVehicleModel';

export interface PartnershipVehicleMapAttributes {
    partnership_id: number;
    vehicle_id: number;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface PartnershipVehicleMapCreationAttributes
    extends Optional<PartnershipVehicleMapAttributes, 'partnership_id'> {}

export class PartnershipVehicleMapModel
    extends Model<PartnershipVehicleMapAttributes, PartnershipVehicleMapCreationAttributes>
    implements PartnershipVehicleMapAttributes
{
    partnership_id!: number;
    vehicle_id!: number;
}

PartnershipVehicleMapModel.init(
    {
        partnership_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        vehicle_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
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
        tableName: 'partnership_vehicle_map',
        timestamps: true,
        createdAt: false,
        updatedAt: false,
        paranoid: true,
        deletedAt: 'deleted_at',
        indexes: [
            {
                name: 'partnership_id',
                using: 'BTREE',
                fields: [{ name: 'partnership_id' }],
            },
            {
                name: 'vehicle_id',
                using: 'BTREE',
                fields: [{ name: 'vehicle_id' }],
            },
        ],
    },
);

PartnershipVehicleMapModel.belongsTo(PartnershipModel, {
    foreignKey: 'partnership_id',
    as: 'partnership',
});

PartnershipVehicleMapModel.belongsTo(PartnerVehicleModel, {
    foreignKey: 'vehicle_id',
    as: 'partnerVehicle',
});

export default PartnershipVehicleMapModel;
