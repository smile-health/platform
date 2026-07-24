import { DataTypes, Optional } from 'sequelize';
import { Model } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteTransportationExternalGroupModel from './WasteTransportationExternalGroupModel';

// enum('READY_FOR_TREATMENT','INCINERATION_IN_PROCESS','STERILIZATION_IN_PROCESS','INCINERATED','STERILISED','LANDFILLED','RECYCLED','DISPOSED','COLLECTED')
export interface WasteTreatmentExternalGroupModelAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    created_at?: Date;
    updated_at?: Date;
    totalBagsCount: number;
    totalWeightInKgs: number;
    sourceExternalTransportationGroupId?: number;
    treatmentProviderId?: number;
    treatmentOperatorId?: string;
    transportationStatus:
        | 'STORED_FOR_TREATMENT'
        | 'READY_FOR_TREATMENT'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED'
        | 'LANDFILLED'
        | 'RECYCLED'
        | 'DISPOSED'
        | 'COLLECTED';
    wasteBags?: any;
    isReadOnly?: boolean;
    groupId?: string;
    transportExternalGroup?: any;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}
interface WasteTreatmentExternalGroupModelCreationAttributes
    extends Optional<WasteTreatmentExternalGroupModelAttributes, 'id'> {}

export class WasteTreatmentExternalGroupModel
    extends Model<
        WasteTreatmentExternalGroupModelAttributes,
        WasteTreatmentExternalGroupModelCreationAttributes
    >
    implements WasteTreatmentExternalGroupModelAttributes
{
    id?: number;
    createdBy!: string;
    updatedBy!: string;
    created_at!: Date;
    updated_at!: Date;
    totalBagsCount!: number;
    totalWeightInKgs!: number;
    sourceExternalTransportationGroupId?: number;
    treatmentProviderId?: number;
    treatmentOperatorId?: string;
    transportationStatus!:
        | 'STORED_FOR_TREATMENT'
        | 'READY_FOR_TREATMENT'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED'
        | 'LANDFILLED'
        | 'RECYCLED'
        | 'DISPOSED'
        | 'COLLECTED';
    wasteBags?: any;
    transportExternalGroup?: any;
    isReadOnly?: boolean;
    groupId?: string;
}

WasteTreatmentExternalGroupModel.init(
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
        treatmentProviderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'treatment_provider_id',
        },
        sourceExternalTransportationGroupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'source_external_transportation_group_id',
        },
        treatmentOperatorId: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'treatment_operator_id',
        },
        transportationStatus: {
            type: DataTypes.ENUM(
                'STORED_FOR_TREATMENT',
                'READY_FOR_TREATMENT',
                'INCINERATION_IN_PROCESS',
                'STERILIZATION_IN_PROCESS',
                'INCINERATED',
                'STERILISED',
                'LANDFILLED',
                'RECYCLED',
                'DISPOSED',
                'COLLECTED',
            ),
            allowNull: false,
            defaultValue: 'STORED_FOR_TREATMENT',
            field: 'transportation_status',
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
        tableName: 'waste_treatment_external_group',
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

WasteTreatmentExternalGroupModel.hasOne(WasteTransportationExternalGroupModel, {
    foreignKey: 'waste_treatment_external_group_id',
    as: 'transportExternalGroup',
});
