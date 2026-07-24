import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import EntityLocationModel from './EntityLocationModel';
import EntitiesModel from './EntitiesModel';

export interface ManualScaleRequestAttributes {
    id?: number;
    requestedBy: string;
    processedBy?: string;
    isActive: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_FOR_APPROVAL';
    approvalType: 'TIME_BOUND' | 'COUNT_BASED';
    validUntil?: Date;
    countLimit?: number;
    entityId: number;
    created_at?: Date;
    updated_at?: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface ManualScaleRequestCreationAttributes
    extends Optional<ManualScaleRequestAttributes, 'id'> {}

class ManualScaleRequestModel
    extends Model<ManualScaleRequestAttributes, ManualScaleRequestCreationAttributes>
    implements ManualScaleRequestAttributes
{
    id?: number;
    requestedBy!: string;
    processedBy?: string;
    isActive!: boolean;
    status!: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_FOR_APPROVAL';
    approvalType!: 'TIME_BOUND' | 'COUNT_BASED';
    validUntil?: Date;
    countLimit?: number;
    entityId!: number;
    created_at?: Date;
    updated_at?: Date;
    entityLocation?: any;
}

ManualScaleRequestModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        requestedBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'requested_by',
        },
        processedBy: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'processed_by',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active',
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'WAITING_FOR_APPROVAL'),
            allowNull: false,
            defaultValue: 'PENDING',
            field: 'status',
        },
        approvalType: {
            type: DataTypes.ENUM('TIME_BOUND', 'COUNT_BASED'),
            allowNull: true,
            field: 'approval_type',
        },
        validUntil: {
            type: DataTypes.DATE(3),
            allowNull: true,
            field: 'valid_until',
        },
        countLimit: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: 'count_limit',
        },
        entityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'entity_id',
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
        tableName: 'manual_scale_request',
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
            {
                name: 'manual_scale_request_requested_by',
                unique: false,
                using: 'BTREE',
                fields: [{ name: 'requested_by' }],
            },
            {
                name: 'manual_scale_request_created_at',
                unique: false,
                using: 'BTREE',
                fields: [{ name: 'created_at' }],
            },
            {
                name: 'manual_scale_request_entity_id',
                unique: false,
                using: 'BTREE',
                fields: [{ name: 'entity_id' }],
            },
        ],
    },
);

ManualScaleRequestModel.belongsTo(EntityLocationModel, {
    foreignKey: { name: 'entityId', field: 'entity_id' },
    targetKey: 'entityId',
    as: 'entityLocation',
});

ManualScaleRequestModel.belongsTo(EntitiesModel, {
    foreignKey: 'entity_id',
    as: 'entities',
});

export default ManualScaleRequestModel;
