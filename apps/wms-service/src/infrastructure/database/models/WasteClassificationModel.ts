import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteHierarchyModel from './WasteHierarchyModel';

export interface WasteClassificationAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    regionId: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    wasteTypeId: number;
    wasteGroupId: number;
    wasteCharacteristicsId: number;
    wasteCode: string;
    wasteBagColorCode: 'BLACK' | 'GRAY' | 'YELLOW' | 'PURPLE' | 'BROWN' | 'RED' | 'NONE';
    storageRuleType: 'STATIC' | 'RULE_BASED' | undefined;
    useColdStorage: boolean;
    coldStorageMinHours: number | undefined;
    coldStorageMaxHours: number | undefined;
    tempStorageMinHours: number | undefined;
    tempStorageMaxHours: number | undefined;
    minimunDecayDay: number | undefined;
    storageRule: string | undefined;
    allowHealthcareFacilityTreatment: boolean;
    isActive: boolean;
    hasMultipleTransporters: boolean;
    treatmentMethod?: string | null;
    disposalMethod: string | undefined;
    allowedVehicleTypes?: string | null;
    updatedAt?: Date;
    wasteType?: any;
    wasteGroup?: any;
    wasteCharacteristics?: any;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

export interface WasteClassificationAttributesId {
    id: number;
    wasteCode: string;
}

interface WasteClassificationCreationAttributes
    extends Optional<WasteClassificationAttributes, 'id'> {}

export class WasteClassificationModel
    extends Model<WasteClassificationAttributes, WasteClassificationCreationAttributes>
    implements WasteClassificationAttributes
{
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    regionId!: number;
    effectiveFrom!: Date;
    effectiveTo?: Date;
    wasteTypeId!: number;
    wasteGroupId!: number;
    wasteCharacteristicsId!: number;
    wasteCode!: string;
    wasteBagColorCode!: 'BLACK' | 'GRAY' | 'YELLOW' | 'PURPLE' | 'BROWN' | 'RED' | 'NONE';
    storageRuleType: 'STATIC' | 'RULE_BASED' | undefined;
    useColdStorage!: boolean;
    coldStorageMinHours: number | undefined;
    coldStorageMaxHours: number | undefined;
    tempStorageMinHours: number | undefined;
    tempStorageMaxHours: number | undefined;
    minimunDecayDay: number | undefined;
    storageRule: string | undefined;
    allowHealthcareFacilityTreatment!: boolean;
    isActive!: boolean;
    hasMultipleTransporters!: boolean;
    treatmentMethod?: string | null;
    disposalMethod: string | undefined;
    allowedVehicleTypes?: string | null;
    updatedAt?: Date;
    wasteType?: any;
    wasteGroup?: any;
    wasteCharacteristics?: any;
}

WasteClassificationModel.init(
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
        regionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'region_id',
        },
        effectiveFrom: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'effective_from',
        },
        effectiveTo: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'effective_to',
        },
        wasteTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'waste_type_id',
        },
        wasteGroupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'waste_group_id',
        },
        wasteCharacteristicsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'waste_characteristics_id',
        },
        wasteCode: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: 'waste_code',
        },
        wasteBagColorCode: {
            type: DataTypes.ENUM('BLACK', 'GRAY', 'YELLOW', 'PURPLE', 'BROWN', 'RED', 'NONE'),
            allowNull: false,
            field: 'waste_bag_color_code',
        },
        storageRuleType: {
            type: DataTypes.ENUM('STATIC', 'RULE_BASED'),
            allowNull: true,
            field: 'storage_rule_type',
        },
        useColdStorage: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'use_cold_storage',
        },
        coldStorageMinHours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'cold_storage_min_hours',
        },
        coldStorageMaxHours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'cold_storage_max_hours',
        },
        tempStorageMinHours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'temp_storage_min_hours',
        },
        tempStorageMaxHours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'temp_storage_max_hours',
        },
        minimunDecayDay: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'minimun_decay_day',
        },
        storageRule: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'storage_rule',
        },
        allowHealthcareFacilityTreatment: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'allow_healthcare_facility_treatment',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active',
        },
        hasMultipleTransporters: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'has_multiple_transporters',
        },
        treatmentMethod: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'treatment_method',
        },
        disposalMethod: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'disposal_method',
        },
        allowedVehicleTypes: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'allowed_vehicle_types',
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updated_at',
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
        tableName: 'waste_classification',
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

WasteClassificationModel.belongsTo(WasteHierarchyModel, {
    foreignKey: 'waste_type_id',
    as: 'wasteType',
});

WasteClassificationModel.belongsTo(WasteHierarchyModel, {
    foreignKey: 'waste_group_id',
    as: 'wasteGroup',
});

WasteClassificationModel.belongsTo(WasteHierarchyModel, {
    foreignKey: 'waste_characteristics_id',
    as: 'wasteCharacteristics',
    scope: {
        is_active: 1,
    },
});

export default WasteClassificationModel;
