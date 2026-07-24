import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { sequelize } from '../db.connection';
import DisposalItemsModel from './DisposalItemsModel';

export interface DisposalAttributes {
    id?: number;
    bastNo: string;
    description?: string;
    createdBy: string;
    createdName?: string;
    entityId: number;
    entityName?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    isRead: boolean;
    approvedBy?: string;
    rejectedBy?: string;
    rejectedReason?: string;
    approvedAt?: Date;
    rejectedAt?: Date;
    createdAt?: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface DisposalCreationAttributes extends Optional<DisposalAttributes, 'id'> {}

export class DisposalModel extends Model<DisposalAttributes, DisposalCreationAttributes> {
    id?: number;
    bastNo!: string;
    description?: string;
    createdBy!: string;
    createdName?: string;
    entityId!: number;
    entityName?: string;
    status!: 'PENDING' | 'APPROVED' | 'REJECTED';
    isRead!: boolean;
    approvedBy?: string;
    rejectedBy?: string;
    rejectedReason?: string;
    approvedAt?: Date;
    rejectedAt?: Date;
    createdAt?: Date;
}

DisposalModel.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        entityId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'entity_id',
        },
        bastNo: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'bast_no',
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'description',
        },
        createdName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'created_name',
        },
        entityName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'entity_name',
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            allowNull: false,
            defaultValue: 'PENDING',
            field: 'status',
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_read',
        },
        createdBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'created_by',
        },
        approvedBy: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'approved_by',
        },
        approvedAt: {
            type: DataTypes.DATE(3),
            allowNull: true,
            field: 'approved_at',
        },
        rejectedBy: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'rejected_by',
        },
        rejectedAt: {
            type: DataTypes.DATE(3),
            allowNull: true,
            field: 'rejected_at',
        },
        rejectedReason: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'rejected_reason',
        },
        createdAt: {
            type: DataTypes.DATE(3),
            allowNull: true,
            field: 'created_at',
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
        tableName: 'disposal',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
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
            {
                name: 'idx_disposal_is_read',
                using: 'BTREE',
                fields: [{ name: 'is_read' }],
            },
            {
                name: 'idx_disposal_created_at',
                using: 'BTREE',
                fields: [{ name: 'created_at' }],
            },
            {
                name: 'idx_disposal_bast_no',
                using: 'BTREE',
                fields: [{ name: 'bast_no' }],
            },
            {
                name: 'idx_disposal_entity_name',
                using: 'BTREE',
                fields: [{ name: 'entity_name' }],
            },
        ],
    },
);

export default DisposalModel;
