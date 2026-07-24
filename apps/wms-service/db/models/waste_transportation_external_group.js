const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_transportation_external_group',
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
            updated_by: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            total_bags_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            total_weight_in_kgs: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            transporter_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            transporter_vehicle_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            transporter_operator_id: {
                type: DataTypes.STRING(36),
                allowNull: true,
            },
            treatment_provider_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            treatment_operator_id: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            handover_lattitude: {
                type: DataTypes.FLOAT(10, 6),
                allowNull: true,
            },
            handover_longitude: {
                type: DataTypes.FLOAT(10, 6),
                allowNull: true,
            },
            handover_timestamp: {
                type: DataTypes.DATE(3),
                allowNull: true,
            },
            transportation_status: {
                type: DataTypes.ENUM('IN_TRANSIT'),
                allowNull: false,
                defaultValue: 'IN_TRANSIT',
            },
            is_read_only: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            tableName: 'waste_transportation_external_group',
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
                    name: 'waste_transportation_external_group_transporter_id',
                    using: 'BTREE',
                    fields: [{ name: 'transporter_id' }],
                },
                {
                    name: 'waste_transportation_external_group_created_at',
                    using: 'BTREE',
                    fields: [{ name: 'created_at' }],
                },
            ],
        },
    );
};
