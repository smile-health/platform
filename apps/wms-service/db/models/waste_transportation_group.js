const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_transportation_group',
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
            transporter_vehicle_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            transporter_operator_id: {
                type: DataTypes.STRING(36),
                allowNull: true,
            },
            handover_lattitude: {
                type: DataTypes.FLOAT(10, 6),
                allowNull: true,
            },
            handover_longitude: {
                type: DataTypes.FLOAT(10, 6),
                allowNull: true,
            },
            transportation_status: {
                type: DataTypes.ENUM('READY_FOR_TRANSPORT', 'TRANSPORTATION_REQUEST_CREATED'),
                allowNull: false,
                defaultValue: 'READY_FOR_TRANSPORT',
            },
            handover_timestamp: {
                type: DataTypes.DATE(3),
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            sequelize,
            tableName: 'waste_transportation_group',
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
            ],
        },
    );
};
