import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteClassificationModel from './WasteClassificationModel';
import WasteSourceModel from './WasteSourceModel';
import { WasteSourceAttributes } from './WasteSourceModel';
import { WasteClassificationAttributes } from './WasteClassificationModel';
import { WasteBagTreatmentGroupModelAttributes } from './WasteBagTreatmentGroupModel';
import { WasteTransportationGroupAttributes } from './WasteTransportationGroupModel';
import { WasteTreatmentExternalGroupModelAttributes } from './WasteTreatmentExternalGroupModel';
import { WasteTransportationExternalGroupAttributes } from './WasteTransportationExternalGroupModel';

export interface WasteBagRecordModelAttributes {
    id?: number;
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date;
    updatedBy?: string;
    wasteBagQrCodeId?: string;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    sourceTreatmentGroupId?: string;
    scaleMethod: 'IOT' | 'MANUAL';
    assetId?: number;
    weightInKgs?: number;
    storageStartTimestamp?: Date;
    scheduledStorageEndDatetime?: Date;
    actualStorageEndTimestamp?: Date;
    maxStorageHours?: number;
    minStorageHours?: number;
    wasteTreatmentGroupId?: number;
    wasteTransportationGroupId?: number;
    wasteTreatmentExternalGroupId?: number;
    wasteTransportationExternalGroupId?: number;
    wasteStatus:
        | 'INTERNAL_LANDFILL_IN_PROCESS'
        | 'INTERNAL_LANDFILLED'
        | 'IN_TEMPORARY_STORAGE'
        | 'IN_COLD_STORAGE'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED'
        | 'READY_FOR_TRANSPORT'
        | 'TRANSPORTATION_REQUEST_CREATED'
        | 'IN_TRANSIT'
        | 'HANDOVER_TO_TREATMENT'
        | 'READY_FOR_TREATMENT'
        | 'IN_THIRD_PARTY_STORAGE'
        | 'RECYCLED'
        | 'LANDFILLED'
        | 'COLLECTED'
        | 'DISPOSED';
    wasteStatusUpdatedAt?: Date;
    wasteStatusUpdatedBy?: string;
    transportationStatus?: 'REQUESTED' | 'IN_TRANSIT' | 'HANDED_OVER';
    transportationStatusUpdatedAt?: Date;
    transportationStatusUpdatedBy?: string;
    ownedBy: 'HEALTHCARE_FACILITY' | 'TRANSPORTER' | 'THIRD_PARTY';
    transporterId?: number;
    thirdPartyId?: number;
    isTreated: boolean;
    isDisposed: boolean;
    binNumber?: string;
    iotMethod?: 'BLUETOOTH' | 'INTERNET';
    manifestDocNumber?: string;
    manifestDocPath?: string;
    treatmentStartTime?: Date;
    treatmentEndTime?: Date;
    wasteGroupIds?: string;
    treatmentLocationId?: number;
    healthcareFacilityName?: string;
    provinceId?: number;
    provinceName?: string;
    regencyId?: number;
    regencyName?: string;
    districtId?: number;
    districtName?: string;
    transporterName?: string;
    thirdPartyName?: string;
    bastNo?: string;
    materialIds?: string;
    wasteSource?: WasteSourceAttributes;
    wasteClassification?: WasteClassificationAttributes;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface WasteBagRecordModelCreationAttributes
    extends Optional<WasteBagRecordModelAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class WasteBagRecordModel
    extends Model<WasteBagRecordModelAttributes, WasteBagRecordModelCreationAttributes>
    implements WasteBagRecordModelAttributes
{
    id?: number;
    createdBy!: string;
    createdAt!: Date;
    updatedAt?: Date;
    updatedBy!: string;
    wasteBagQrCodeId!: string;
    healthcareFacilityId!: number;
    wasteSourceId!: number;
    wasteClassificationId!: number;
    sourceTreatmentGroupId?: string;
    scaleMethod!: 'IOT' | 'MANUAL';
    assetId?: number;
    weightInKgs?: number;
    storageStartTimestamp?: Date;
    scheduledStorageEndDatetime?: Date;
    actualStorageEndTimestamp?: Date;
    maxStorageHours?: number;
    minStorageHours?: number;
    wasteTreatmentGroupId?: number;
    wasteTransportationGroupId?: number;
    wasteTreatmentExternalGroupId?: number;
    wasteTransportationExternalGroupId?: number;
    wasteStatus!:
        | 'INTERNAL_LANDFILL_IN_PROCESS'
        | 'INTERNAL_LANDFILLED'
        | 'IN_TEMPORARY_STORAGE'
        | 'IN_COLD_STORAGE'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED'
        | 'READY_FOR_TRANSPORT'
        | 'TRANSPORTATION_REQUEST_CREATED'
        | 'IN_TRANSIT'
        | 'HANDOVER_TO_TREATMENT'
        | 'READY_FOR_TREATMENT'
        | 'IN_THIRD_PARTY_STORAGE'
        | 'RECYCLED'
        | 'LANDFILLED'
        | 'COLLECTED'
        | 'DISPOSED';
    wasteStatusUpdatedAt?: Date;
    wasteStatusUpdatedBy?: string;
    transportationStatus?: 'REQUESTED' | 'IN_TRANSIT' | 'HANDED_OVER';
    transportationStatusUpdatedAt?: Date;
    transportationStatusUpdatedBy?: string;
    ownedBy!: 'HEALTHCARE_FACILITY' | 'TRANSPORTER' | 'THIRD_PARTY';
    transporterId?: number;
    thirdPartyId?: number;
    isTreated!: boolean;
    isDisposed!: boolean;
    binNumber?: string;
    iotMethod?: 'BLUETOOTH' | 'INTERNET';
    manifestDocNumber?: string;
    manifestDocPath?: string;
    treatmentStartTime?: Date;
    treatmentEndTime?: Date;
    wasteGroupIds?: string;
    treatmentLocationId?: number;
    healthcareFacilityName?: string;
    provinceId?: number;
    provinceName?: string;
    regencyId?: number;
    regencyName?: string;
    districtId?: number;
    districtName?: string;
    transporterName?: string;
    thirdPartyName?: string;
    bastNo?: string;
    materialIds?: string;
    wasteSource?: WasteSourceAttributes;
    wasteClassification?: WasteClassificationAttributes;
}

WasteBagRecordModel.init(
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
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('now'),
            field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updated_at',
        },
        updatedBy: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'updated_by',
        },
        wasteBagQrCodeId: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: 'waste_bag_qr_code_id',
            field: 'waste_bag_qr_code_id',
        },
        healthcareFacilityId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'healthcare_facility_id',
        },
        wasteSourceId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'waste_source_id',
        },
        wasteClassificationId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'waste_classification_id',
        },
        sourceTreatmentGroupId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'source_treatment_group_id',
        },
        scaleMethod: {
            type: DataTypes.ENUM('IOT', 'MANUAL'),
            allowNull: false,
            defaultValue: 'IOT',
            field: 'scale_method',
        },
        assetId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'asset_id',
        },
        weightInKgs: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'weight_in_kgs',
        },
        storageStartTimestamp: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'storage_start_timestamp',
        },
        scheduledStorageEndDatetime: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'scheduled_storage_end_datetime',
        },
        actualStorageEndTimestamp: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'actual_storage_end_timestamp',
        },
        maxStorageHours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'max_storage_hours',
        },
        minStorageHours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'min_storage_hours',
        },
        wasteTreatmentGroupId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'waste_treatment_group_id',
        },
        wasteTransportationGroupId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'waste_transportation_group_id',
        },
        wasteStatus: {
            type: DataTypes.ENUM(
                'INTERNAL_LANDFILL_IN_PROCESS',
                'INTERNAL_LANDFILLED',
                'IN_TEMPORARY_STORAGE',
                'IN_COLD_STORAGE',
                'INCINERATION_IN_PROCESS',
                'STERILIZATION_IN_PROCESS',
                'INCINERATED',
                'STERILISED',
                'READY_FOR_TRANSPORT',
                'TRANSPORTATION_REQUEST_CREATED',
                'IN_TRANSIT',
                'READY_FOR_TREATMENT',
                'STORED_FOR_TREATMENT',
                'RECYCLED',
                'LANDFILLED',
                'COLLECTED',
                'DISPOSED',
            ),
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
            field: 'waste_status',
        },
        wasteStatusUpdatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: Sequelize.fn('now'),
            field: 'waste_status_updated_at',
        },
        wasteStatusUpdatedBy: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'waste_status_updated_by',
        },
        transportationStatus: {
            type: DataTypes.ENUM('REQUESTED', 'IN_TRANSIT', 'HANDED_OVER'),
            allowNull: true,
            field: 'transportation_status',
        },
        transportationStatusUpdatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: Sequelize.fn('now'),
            field: 'transportation_status_updated_at',
        },
        transportationStatusUpdatedBy: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'transportation_status_updated_by',
        },
        ownedBy: {
            type: DataTypes.ENUM('HEALTHCARE_FACILITY', 'TRANSPORTER', 'THIRD_PARTY'),
            allowNull: false,
            defaultValue: 'HEALTHCARE_FACILITY',
            field: 'owned_by',
        },
        transporterId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'transporter_id',
        },
        thirdPartyId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'third_party_id',
        },
        wasteTreatmentExternalGroupId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'waste_treatment_external_group_id',
        },
        wasteTransportationExternalGroupId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'waste_transportation_external_group_id',
        },
        isTreated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_treated',
        },
        isDisposed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_disposed',
        },
        binNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'bin_number',
        },
        iotMethod: {
            type: DataTypes.ENUM('BLUETOOTH', 'INTERNET'),
            allowNull: true,
            field: 'iot_method',
        },
        manifestDocNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'manifest_doc_number',
        },
        manifestDocPath: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'manifest_doc_path',
        },
        treatmentStartTime: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'treatment_start_time',
        },
        treatmentEndTime: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'treatment_end_time',
        },
        wasteGroupIds: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'waste_group_ids',
        },
        treatmentLocationId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'treatment_location_id',
        },
        healthcareFacilityName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'healthcare_facility_name',
        },
        provinceId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'province_id',
        },
        regencyId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'regency_id',
        },
        districtId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'district_id',
        },
        provinceName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'province_name',
        },
        regencyName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'regency_name',
        },
        districtName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'district_name',
        },
        transporterName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'transporter_name',
        },
        thirdPartyName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'third_party_name',
        },
        bastNo: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'bast_no',
        },
        materialIds: {
            type: DataTypes.STRING(64),
            allowNull: true,
            field: 'material_ids',
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
        tableName: 'waste_bag_record',
        paranoid: true,
        deletedAt: 'deleted_at',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'waste_bag_record_key_id',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
            {
                name: 'waste_bag_record_qr_code_id',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'waste_bag_qr_code_id' }],
            },
        ],
    },
);

WasteBagRecordModel.belongsTo(WasteClassificationModel, {
    foreignKey: 'wasteClassificationId',
    as: 'wasteClassification',
});

WasteClassificationModel.hasMany(WasteBagRecordModel, {
    foreignKey: 'wasteClassificationId',
    as: 'wasteBagsRecords',
});

WasteBagRecordModel.belongsTo(WasteSourceModel, {
    foreignKey: 'wasteSourceId',
    as: 'wasteSource',
});

export default WasteBagRecordModel;
