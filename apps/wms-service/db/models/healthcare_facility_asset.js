const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'healthcare_facility_asset',
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
            healthcare_facility_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            model_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            is_iot_enabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            asset_id: {
                type: DataTypes.STRING(32),
                allowNull: true,
                unique: true,
            },
            asset_status: {
                type: DataTypes.ENUM(
                    'OPERATIONAL',
                    'UNDER_MAINTENANCE',
                    'OUT_OF_SERVICE',
                    'IDLE',
                    'RETIRED',
                ),
                allowNull: true,
            },
            warranty_end_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            year_of_production: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            warranty_start_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'healthcare_facility_asset',
            timestamps: true,
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
