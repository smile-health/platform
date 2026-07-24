const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'scale_data',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
            },
            timestamp: {
                type: DataTypes.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.Sequelize.fn('now'),
            },
            asset_id: {
                type: DataTypes.STRING(32),
                allowNull: false,
                unique: 'asset_id_UNIQUE',
            },
            value: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'scale_data',
            timestamps: false,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'id' }],
                },
                {
                    name: 'asset_id_UNIQUE',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'asset_id' }],
                },
            ],
        },
    );
};
