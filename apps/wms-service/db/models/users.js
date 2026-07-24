const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'users',
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                allowNull: false,
            },
            user_uuid: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            entity_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            firstname: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            lastname: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING(150),
                allowNull: true,
                unique: true,
            },
            username: {
                type: DataTypes.STRING(100),
                allowNull: true,
                unique: true,
            },
            mobile_phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            gender: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            gender_label: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            date_of_birth: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            role: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            role_label: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            view_only: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            last_device: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            last_login: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            integration_client_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            keycloak_uuid: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            external_roles: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            manufacture_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            village_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            external_properties: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            created_by: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            updated_by: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            deleted_by: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'users',
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
                    name: 'user_uuid_idx',
                    using: 'BTREE',
                    fields: [{ name: 'user_uuid' }],
                },
                {
                    name: 'entity_id_idx',
                    using: 'BTREE',
                    fields: [{ name: 'entity_id' }],
                },
                {
                    name: 'email_idx',
                    using: 'BTREE',
                    fields: [{ name: 'email' }],
                },
                {
                    name: 'username_idx',
                    using: 'BTREE',
                    fields: [{ name: 'username' }],
                },
            ],
        },
    );
};
