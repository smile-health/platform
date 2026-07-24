const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_bag_qr_code',
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
            healthcare_facility_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            waste_source_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            waste_classification_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            qr_code: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'waste_bag_qr_code',
            timestamps: true,
            createdAt: 'created_at',
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
