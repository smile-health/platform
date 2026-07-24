import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteTransportationGroupModel from './WasteTransportationGroupModel';

export interface WasteTransportationRequestAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    requestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    transportationGroupId: number;
    requestCreatorId?: number;
    requestApproverId?: number;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface WasteTransportationRequestCreationAttributes
    extends Optional<WasteTransportationRequestAttributes, 'id'> {}

export class WasteTransportationRequestModel extends Model<
    WasteTransportationRequestAttributes,
    WasteTransportationRequestCreationAttributes
> {}

WasteTransportationRequestModel.init(
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
        requestStatus: {
            type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
            allowNull: true,
            field: 'request_status',
        },
        transportationGroupId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'transportation_group_id',
        },
        requestCreatorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'request_creator_id',
        },
        requestApproverId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'request_approver_id',
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
        tableName: 'waste_transportation_request',
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
    },
);

WasteTransportationRequestModel.belongsTo(WasteTransportationGroupModel, {
    foreignKey: 'transportation_group_id',
    as: 'transportationGroup',
});

WasteTransportationGroupModel.hasMany(WasteTransportationRequestModel, {
    foreignKey: 'transportation_group_id',
    as: 'transportationRequest',
});

export default WasteTransportationRequestModel;
