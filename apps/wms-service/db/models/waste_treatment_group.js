const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_treatment_group',
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
            treatment_asset_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            treatment_operator_id: {
                type: DataTypes.INTEGER,
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
            treatment_status: {
                type: DataTypes.ENUM(
                    'IN_TEMPORARY_STORAGE',
                    'IN_COLD_STORAGE',
                    'INCINERATION_IN_PROCESS',
                    'STERILIZATION_IN_PROCESS',
                    'INCINERATED',
                    'STERILISED',
                ),
                allowNull: false,
                defaultValue: 'IN_TEMPORARY_STORAGE',
            },
            handover_timestamp: {
                type: DataTypes.DATE(3),
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            sequelize,
            tableName: 'waste_treatment_group',
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
