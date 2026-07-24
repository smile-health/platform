const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'healthcare_facility_asset_activity',
        {
            hf_asset_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            created_by: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            operator_id: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            activity_type: {
                type: DataTypes.ENUM('MAINTENANCE', 'CALIBRATION'),
                allowNull: false,
            },
            start_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            end_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'healthcare_facility_asset_activity',
            timestamps: true,
            createdAt: 'created_at',
            indexes: [
                {
                    name: 'PRIMARY',
                    using: 'BTREE',
                    fields: [{ name: 'hf_asset_id' }],
                },
            ],
        },
    );
};
