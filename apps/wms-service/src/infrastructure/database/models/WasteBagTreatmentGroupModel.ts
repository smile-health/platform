import { DataTypes, Optional } from 'sequelize';
import { Model } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteBagModel from './WasteBagModel';
import { WasteBagModelAttributes } from './WasteBagModel';

export interface WasteBagTreatmentGroupModelAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    created_at?: Date;
    updated_at?: Date;
    totalBagsCount: number;
    totalWeightInKgs: number;
    treatmentAssetId?: number;
    treatmentOperatorId?: number;
    handoverLattitude?: number;
    handoverLongitude?: number;
    treatmentStatus:
        | 'IN_TEMPORARY_STORAGE'
        | 'IN_COLD_STORAGE'
        | 'INTERNAL_LANDFILL_IN_PROCESS'
        | 'INTERNAL_LANDFILLED'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED';
    handoverTimestamp?: Date;
    isReadOnly?: boolean;
    groupId?: string;
    wasteBags?: any;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface WasteBagTreatmentGroupModelCreationAttributes
    extends Optional<WasteBagTreatmentGroupModelAttributes, 'id'> {}

export class WasteBagTreatmentGroupModel
    extends Model<
        WasteBagTreatmentGroupModelAttributes,
        WasteBagTreatmentGroupModelCreationAttributes
    >
    implements WasteBagTreatmentGroupModelAttributes
{
    id?: number;
    createdBy!: string;
    updatedBy!: string;
    created_at?: Date;
    updated_at?: Date;
    totalBagsCount!: number;
    totalWeightInKgs!: number;
    treatmentAssetId?: number;
    treatmentOperatorId?: number;
    handoverLattitude?: number;
    handoverLongitude?: number;
    treatmentStatus!:
        | 'IN_TEMPORARY_STORAGE'
        | 'IN_COLD_STORAGE'
        | 'INTERNAL_LANDFILL_IN_PROCESS'
        | 'INTERNAL_LANDFILLED'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED';
    handoverTimestamp?: Date;
    isReadOnly?: boolean;
    groupId?: string;
    wasteBags?: any;
}
WasteBagTreatmentGroupModel.init(
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
        treatmentAssetId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'treatment_asset_id',
        },
        treatmentOperatorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'treatment_operator_id',
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
        treatmentStatus: {
            type: DataTypes.ENUM(
                'IN_TEMPORARY_STORAGE',
                'IN_COLD_STORAGE',
                'INTERNAL_LANDFILL_IN_PROCESS',
                'INTERNAL_LANDFILLED',
                'INCINERATION_IN_PROCESS',
                'STERILIZATION_IN_PROCESS',
                'INCINERATED',
                'STERILISED',
            ),
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
            field: 'treatment_status',
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
        tableName: 'waste_treatment_group',
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
