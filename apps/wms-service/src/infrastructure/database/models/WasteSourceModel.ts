import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface WasteSourceAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    healthcareFacilityId: number;
    sourceType: 'INTERNAL' | 'EXTERNAL' | 'INTERNAL_TREATMENT';
    internalSourceName: string;
    internalTreatmentName: 'PYROLYSIS' | 'DISINFECTION';
    externalHealthcareFacilityId: number;
    externalHealthcareFacilityName: string;
    isActive: boolean;
    isResidue: boolean;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface WasteSourceCreationAttributes extends Optional<WasteSourceAttributes, 'id'> {}

export class WasteSourceModel extends Model<WasteSourceAttributes, WasteSourceCreationAttributes> {}

WasteSourceModel.init(
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
        healthcareFacilityId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'healthcare_facility_id',
        },
        sourceType: {
            type: DataTypes.ENUM('INTERNAL', 'EXTERNAL', 'INTERNAL_TREATMENT'),
            allowNull: false,
            defaultValue: 'INTERNAL',
            field: 'source_type',
        },
        internalSourceName: {
            type: DataTypes.STRING(64),
            allowNull: true,
            field: 'internal_source_name',
        },
        internalTreatmentName: {
            type: DataTypes.ENUM('PYROLYSIS', 'DISINFECTION'),
            allowNull: true,
            field: 'internal_treatment_name',
        },
        externalHealthcareFacilityId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: 'external_healthcare_facility_id',
        },
        externalHealthcareFacilityName: {
            type: DataTypes.STRING(64),
            allowNull: true,
            field: 'external_healthcare_facility_name',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active',
        },
        isResidue: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_residue',
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
        tableName: 'waste_source',
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

export default WasteSourceModel;
