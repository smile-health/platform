import { DataTypes, Optional } from 'sequelize';
import { Model } from 'sequelize';
import { sequelize } from '../db.connection';
import { WasteBagTreatmentGroupModel } from './WasteBagTreatmentGroupModel';

export interface WasteBagTreatmentRequestAttributes {
    id?: number;
    createdBy: string;
    updatedBy: string;
    requestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    treatmentGroupId: number;
    requestCreatorId?: number;
    treatmentOperatorId?: number;
    requestApproverId?: number;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface WasteBagTreatmentRequestCreationAttributes
    extends Optional<WasteBagTreatmentRequestAttributes, 'id'> {}

export class WasteBagTreatmentRequestModel extends Model<
    WasteBagTreatmentRequestAttributes,
    WasteBagTreatmentRequestCreationAttributes
> {}

WasteBagTreatmentRequestModel.init(
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
        treatmentGroupId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'treatment_group_id',
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
        tableName: 'waste_treatment_request',
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
        ],
    },
);

WasteBagTreatmentRequestModel.belongsTo(WasteBagTreatmentGroupModel, {
    foreignKey: 'treatment_group_id',
    as: 'wasteTreatmentGroup',
});

export default WasteBagTreatmentRequestModel;
