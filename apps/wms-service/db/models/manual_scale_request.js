const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'manual_scale_request',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
            },
            requested_by: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            processed_by: {
                type: DataTypes.STRING(36),
                allowNull: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            status: {
                type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'WAITING_FOR_APPROVAL'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            approval_type: {
                type: DataTypes.ENUM('TIME_BOUND', 'COUNT_BASED'),
                allowNull: true,
            },
            valid_until: {
                type: DataTypes.DATE(3),
                allowNull: true,
            },
            count_limit: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            entity_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'manual_scale_request',
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
};
