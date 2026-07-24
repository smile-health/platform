import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { sequelize } from '../db.connection';

export interface ScheduledEventsAttributes {
    id?: number;
    createdBy: string;
    eventType: string;
    scheduledAt: Date;
    metadata?: string;
    createdAt: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'FAILED';
    retryLeft?: number;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface ScheduledEventsCreationAttibutes extends Optional<ScheduledEventsAttributes, 'id'> {}

export class ScheduledEventsModel
    extends Model<ScheduledEventsAttributes, ScheduledEventsCreationAttibutes>
    implements ScheduledEventsAttributes
{
    id?: number;
    createdBy!: string;
    eventType!: string;
    scheduledAt!: Date;
    metadata?: string;
    createdAt!: Date;
    status!: 'PENDING' | 'IN_PROGRESS' | 'FAILED';
    retryLeft?: number;
}

ScheduledEventsModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        createdBy: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'SYSTEM',
            field: 'created_by',
        },
        eventType: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'event_type',
        },
        scheduledAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'scheduled_at',
        },
        metadata: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('now'),
            field: 'created_at',
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'FAILED'),
            allowNull: false,
            defaultValue: 'PENDING',
        },
        retryLeft: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'retry_left',
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
        tableName: 'scheduled_events',
        paranoid: true,
        deletedAt: 'deleted_at',
        timestamps: true,
        createdAt: false,
        updatedAt: false,
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
            {
                name: 'idx_scheduled_at',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'scheduled_at' }],
            },
        ],
    },
);
