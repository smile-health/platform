import { DataTypes, Optional, Model } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteClassificationModel from './WasteClassificationModel';
import EntitiesModel from './EntitiesModel';

export interface PartnershipAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
    contractId?: string;
    contractStartDate?: Date | null;
    contractEndDate?: Date | null;
    consumerId: number;
    consumerType:
        | 'HEALTHCARE_FACILITY'
        | 'TRANSPORTER'
        | 'TRANSPORTER_RECYCLER'
        | 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER'
        | 'TRANSPORTER_LANDFILL'
        | 'TRANSPORTER_TREATMENT'
        | 'TRANSPORTER_TREATMENT_PROVIDER';
    wasteClassificationId?: number;
    providerId: number;
    providerType:
        | 'LANDFILLER'
        | 'TREATMENT_PROVIDER'
        | 'RECYCLER'
        | 'TREATMENT'
        | 'SPECIALIZED_TREATMENT_PROVIDER'
        | 'TRANSPORTER'
        | 'TRANSPORTER_RECYCLER'
        | 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER'
        | 'TRANSPORTER_LANDFILL'
        | 'TRANSPORTER_TREATMENT'
        | 'TRANSPORTER_TREATMENT_PROVIDER'
        | 'TRANSPORTER_GOVERNMENT'
        | 'TRANSPORTER_GOVERNMENT_WASTE_BANK';
    partnershipStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED';
    hasIncinerator: boolean;
    hasAutoclave: boolean;
    picName?: string;
    picPosition?: string;
    picPhoneNumber?: string;
    pricePerKg?: number;
    transporterId?: number | null;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface PartnershipCreationAttributes extends Optional<PartnershipAttributes, 'id'> {}

export class PartnershipModel extends Model<PartnershipAttributes, PartnershipCreationAttributes> {}

PartnershipModel.init(
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
        contractId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'contract_id',
        },
        contractStartDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'contract_start_date',
        },
        contractEndDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: `contract_end_date`,
        },
        consumerId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'consumer_id',
        },
        consumerType: {
            type: DataTypes.ENUM(
                'HEALTHCARE_FACILITY',
                'TRANSPORTER',
                'TRANSPORTER_RECYCLER',
                'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                'TRANSPORTER_LANDFILL',
                'TRANSPORTER_TREATMENT',
                'TRANSPORTER_TREATMENT_PROVIDER',
            ),
            allowNull: false,
            field: 'consumer_type',
        },
        wasteClassificationId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'waste_classification_id',
        },
        providerId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'provider_id',
        },
        providerType: {
            type: DataTypes.ENUM(
                'LANDFILLER',
                'TREATMENT_PROVIDER',
                'RECYCLER',
                'SPECIALIZED_TREATMENT_PROVIDER',
                'TRANSPORTER',
                'TRANSPORTER_RECYCLER',
                'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                'TRANSPORTER_LANDFILL',
                'TRANSPORTER_TREATMENT_PROVIDER',
                'TRANSPORTER_TREATMENT',
                'TRANSPORTER_GOVERNMENT',
            ),
            allowNull: false,
            field: 'provider_type',
        },
        partnershipStatus: {
            type: DataTypes.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED'),
            allowNull: false,
            defaultValue: 'PENDING',
            field: 'partnership_status',
        },
        hasIncinerator: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
            field: 'has_incinerator',
        },
        hasAutoclave: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
            field: 'has_autoclave',
        },
        picName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            field: 'pic_name',
        },
        picPosition: {
            type: DataTypes.STRING(64),
            allowNull: true,
            defaultValue: null,
            field: 'pic_position',
        },
        picPhoneNumber: {
            type: DataTypes.STRING(32),
            allowNull: true,
            defaultValue: null,
            field: 'pic_phone_number',
        },
        pricePerKg: {
            type: DataTypes.FLOAT(10, 2),
            allowNull: true,
            defaultValue: null,
            field: 'price_per_kg',
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
        tableName: 'partnership',
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

PartnershipModel.belongsTo(WasteClassificationModel, {
    foreignKey: 'waste_classification_id',
    as: 'wasteClassification',
});

PartnershipModel.belongsTo(EntitiesModel, {
    foreignKey: 'provider_id',
    as: 'entities',
});

export default PartnershipModel;
