const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'transporter_operator_coodinates',
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
            user_id: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            lattitude: {
                type: DataTypes.FLOAT(10, 6),
                allowNull: false,
            },
            longitude: {
                type: DataTypes.FLOAT(10, 6),
                allowNull: false,
            },
            ttl_in_seconds: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 300,
            },
        },
        {
            sequelize,
            tableName: 'transporter_operator_coodinates',
            timestamps: false,
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
