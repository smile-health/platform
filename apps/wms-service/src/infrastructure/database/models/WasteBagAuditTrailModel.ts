import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import WasteBagModel from '../../../infrastructure/database/models/WasteBagModel';

export interface WasteBagAuditTrailAttributes {
    id?: number;
    waste_bag_id: string;
    event: string;
    waste_bag_status: string;
    transport_status: string | null;
    healthcare_facility_id: number;
    transporter_id: number | null;
    third_party_provider_id: number | null;
    updated_by: string;
    source: string;
    remarks: string | null;
    is_group?: boolean;
    is_failed?: boolean;
    created_at?: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface WasteBagAuditTrailCreationAttributes
    extends Optional<WasteBagAuditTrailAttributes, 'id' | 'created_at'> {}

export class WasteBagAuditTrailModel
    extends Model<WasteBagAuditTrailAttributes, WasteBagAuditTrailCreationAttributes>
    implements WasteBagAuditTrailAttributes
{
    id?: number;
    waste_bag_id!: string;
    event!: string;
    waste_bag_status!: string;
    transport_status: string | null = null;
    healthcare_facility_id!: number;
    transporter_id: number | null = null;
    third_party_provider_id: number | null = null;
    updated_by!: string;
    source!: string;
    remarks: string | null = null;
    is_group?: boolean;
    is_failed?: boolean;
    created_at?: Date;

    static associate(models: any) {
        // Define associations here if needed
        // e.g., this.belongsTo(models.WasteBag, { foreignKey: 'waste_bag_id' });
    }
}

WasteBagAuditTrailModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        waste_bag_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        event: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        waste_bag_status: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        transport_status: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        healthcare_facility_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        transporter_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        third_party_provider_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        source: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        is_group: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_failed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        tableName: 'waste_bag_audit_trail',
        paranoid: true,
        deletedAt: 'deleted_at',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
            {
                name: 'idx_waste_bag_id',
                using: 'BTREE',
                fields: [{ name: 'waste_bag_id' }],
            },
            {
                name: 'idx_facility_created_at',
                using: 'BTREE',
                fields: [{ name: 'healthcare_facility_id' }, { name: 'created_at' }],
            },
        ],
    },
);

WasteBagAuditTrailModel.belongsTo(WasteBagModel, {
    foreignKey: 'waste_bag_id',
    as: 'logHistory',
});

WasteBagModel.hasMany(WasteBagAuditTrailModel, {
    foreignKey: 'waste_bag_id',
    sourceKey: 'wasteBagQrCodeId',
    as: 'logHistory',
});
