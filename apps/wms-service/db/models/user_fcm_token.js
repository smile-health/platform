const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'user_fcm_token',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            entity_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            user_uuid: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            token: {
                type: DataTypes.STRING(500),
                allowNull: false,
                unique: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        },
        {
            sequelize,
            tableName: 'user_fcm_token',
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
                {
                    name: 'idx_user_uuid',
                    using: 'BTREE',
                    fields: [{ name: 'user_uuid' }],
                },
                {
                    name: 'idx_user_id',
                    using: 'BTREE',
                    fields: [{ name: 'user_id' }],
                },
            ],
        },
    );
};
