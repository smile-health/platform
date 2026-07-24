const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'asset_model',
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
            asset_type: {
                type: DataTypes.ENUM('SCALE', 'INCINERATOR', 'AUTOCLAVE', 'COLD_STORAGE'),
                allowNull: false,
            },
            manufacturer_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(64),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'asset_model',
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
