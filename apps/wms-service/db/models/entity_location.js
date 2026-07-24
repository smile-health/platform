const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'entity_location',
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
                allowNull: true,
            },
            entity_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            location_name: {
                type: DataTypes.STRING(64),
                allowNull: false,
            },
            latitude: {
                type: DataTypes.FLOAT(10, 6),
                allowNull: false,
            },
            longitude: {
                type: DataTypes.FLOAT(10, 6),
                allowNull: false,
            },
            distance_limit_in_meters: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            province_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            city_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            province_name: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            city_name: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'entity_location',
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
                    name: 'entity_id_index',
                    using: 'BTREE',
                    fields: [{ name: 'entity_id' }],
                },
                {
                    name: 'location_name_index',
                    using: 'BTREE',
                    fields: [{ name: 'location_name' }],
                },
                {
                    name: 'province_id_index',
                    using: 'BTREE',
                    fields: [{ name: 'province_id' }],
                },
                {
                    name: 'city_id_index',
                    using: 'BTREE',
                    fields: [{ name: 'city_id' }],
                },
            ],
        },
    );
};
