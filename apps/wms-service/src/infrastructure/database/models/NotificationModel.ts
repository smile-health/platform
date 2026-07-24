import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db-notification.connection';

export interface NotificationAttributes {
    id?: number;
    message?: string;
    userId: number;
    provinceId?: number;
    regencyId?: number;
    entityId: number;
    media: string;
    title?: string;
    type: string;
    createdAt?: Date;
    updatedAt?: Date;
    readAt?: Date | null;
    mobilePhone?: string;
    actionUrl?: string;
    downloadUrl?: string;
    patientId?: number | null;
    programId?: number | null;
    userName?: string;
    entityName?: string;
    forSuperAdmin?: boolean;
    forAdmin?: boolean;
    forOperator?: boolean;
}

interface NotificationCreationAttributes
    extends Optional<NotificationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'readAt'> {}

export class NotificationModel
    extends Model<NotificationAttributes, NotificationCreationAttributes>
    implements NotificationAttributes
{
    id?: number;
    message?: string;
    userId!: number;
    provinceId?: number;
    regencyId?: number;
    entityId!: number;
    media!: string;
    title?: string;
    type!: string;
    createdAt?: Date;
    updatedAt?: Date;
    readAt?: Date | null;
    mobilePhone?: string;
    actionUrl?: string;
    downloadUrl?: string;
    patientId?: number | null;
    programId?: number | null;
    userName?: string;
    entityName?: string;
    forSuperAdmin?: boolean;
    forAdmin?: boolean;
    forOperator?: boolean;
}

NotificationModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'user_id',
        },
        provinceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'province_id',
        },
        regencyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'regency_id',
        },
        entityId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'entity_id',
        },
        media: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'updated_at',
        },
        readAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'read_at',
        },
        mobilePhone: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'mobile_phone',
        },
        actionUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'action_url',
        },
        downloadUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'download_url',
        },
        patientId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'patient_id',
        },
        programId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'program_id',
        },
        forSuperAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
            field: 'for_super_admin',
        },
        forAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
            field: 'for_admin',
        },
        forOperator: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
            field: 'for_operator',
        },
    },
    {
        sequelize,
        tableName: 'notifications',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
            {
                name: 'notifications_user_id',
                using: 'BTREE',
                fields: [{ name: 'user_id' }],
            },
            {
                name: 'notifications_province_id',
                using: 'BTREE',
                fields: [{ name: 'province_id' }],
            },
            {
                name: 'notifications_regency_id',
                using: 'BTREE',
                fields: [{ name: 'regency_id' }],
            },
            {
                name: 'notifications_entity_id',
                using: 'BTREE',
                fields: [{ name: 'entity_id' }],
            },
            {
                name: 'notifications_type',
                using: 'BTREE',
                fields: [{ name: 'type' }],
            },
            {
                name: 'notifications_created_at',
                using: 'BTREE',
                fields: [{ name: 'created_at' }],
            },
            {
                name: 'notifications_read_at',
                using: 'BTREE',
                fields: [{ name: 'read_at' }],
            },
        ],
    },
);

export default NotificationModel;
