const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'qr_code_config',
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
            label_count: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'qr_code_config',
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
