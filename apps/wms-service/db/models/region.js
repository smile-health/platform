const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'region',
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
            region_type: {
                type: DataTypes.ENUM(
                    'COUNTRY',
                    'PROVINCE/STATE',
                    'CITY',
                    'DISTRICT',
                    'SUB-DISTRICT',
                    'VILLAGE',
                ),
                allowNull: false,
                defaultValue: 'COUNTRY',
            },
            parent_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            code: {
                type: DataTypes.STRING(16),
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(32),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'region',
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
                    name: 'parent_id',
                    using: 'BTREE',
                    fields: [{ name: 'parent_id' }],
                },
            ],
        },
    );
};
