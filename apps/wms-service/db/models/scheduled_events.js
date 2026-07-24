const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'scheduled_events',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
            },
            created_by: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'SYSTEM',
            },
            event_type: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            scheduled_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            metadata: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.Sequelize.fn('now'),
            },
            status: {
                type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'FAILED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            retry_left: {
                type: DataTypes.NUMBER,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'scheduled_events',
            timestamps: false,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'id' }],
                },
                {
                    name: 'idx_scheduled_at',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'scheduled_at' }],
                },
            ],
        },
    );
};
