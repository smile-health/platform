const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_classification',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER.UNSIGNED,
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
            region_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            effective_from: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.Sequelize.fn('now'),
            },
            effective_to: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.Sequelize.fn('now'),
            },
            waste_type_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            waste_group_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            waste_characteristics_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            waste_code: {
                type: DataTypes.STRING(64),
                allowNull: false,
            },
            waste_bag_color_code: {
                type: DataTypes.ENUM('BLACK', 'GRAY', 'YELLOW', 'PURPLE', 'BROWN', 'RED', 'NONE'),
                allowNull: false,
            },
            storage_rule_type: {
                type: DataTypes.ENUM('STATIC', 'RULE_BASED'),
                allowNull: true,
            },
            use_cold_storage: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            cold_storage_min_hours: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            cold_storage_max_hours: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            temp_storage_min_hours: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            temp_storage_max_hours: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            storage_rule: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            allow_healthcare_facility_treatment: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            treatment_method: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            disposal_method: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            allowed_vehicle_types: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'waste_classification',
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
