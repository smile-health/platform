const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'entities',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            type: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tag: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            province_id: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            regency_id: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            sub_district_id: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            village_id: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            integration_type: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            integration_client_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            location: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            external_properties: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            // entity_type flatten
            entity_type_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            entity_type_name: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            entity_type_integration_type: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            entity_type_external_properties: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            province_name: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            regency_name: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            district_name: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'entities',
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
                    name: 'name_idx',
                    using: 'BTREE',
                    fields: [{ name: 'name' }],
                },
                {
                    name: 'province_id_idx',
                    using: 'BTREE',
                    fields: [{ name: 'province_id' }],
                },
                {
                    name: 'village_id_idx',
                    using: 'BTREE',
                    fields: [{ name: 'village_id' }],
                },
            ],
        },
    );
};
