const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'notification',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
            },
            created_by: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            target_user_id: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            sender_type: {
                type: DataTypes.ENUM('HEALTHCARE_FACILITY', 'TRANSPORTER'),
                allowNull: false,
            },
            healthcare_facility_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            transporter_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            notification_type: {
                type: DataTypes.ENUM(
                    'TRANSPORTATION_REQUEST',
                    'TRANSPORTATION_REQUEST_ACCEPTED',
                    'TRANSPORTATION_REQUEST_REJECTED',
                    'TREATMENT_REQUEST',
                    'TREATMENT_REQUEST_ACCEPTED',
                    'TREATMENT_REQUEST_REJECTED',
                    'STORAGE_OVERDUE',
                    'OTHER',
                ),
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            payload: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            channel: {
                type: DataTypes.ENUM('EMAIL', 'SMS', 'PUSH_NOTIFICATION'),
                allowNull: false,
            },
            delivery_status: {
                type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            last_attempt_at: {
                type: DataTypes.DATE(3),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'notification',
            timestamps: true,
            createdAt: 'created_at',
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'id' }],
                },
                {
                    name: 'target_user_id',
                    using: 'BTREE',
                    fields: [{ name: 'target_user_id' }],
                },
            ],
        },
    );
};
