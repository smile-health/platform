'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('entities', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(150),
                allowNull: false,
            },
            type: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            tag: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            province_id: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            regency_id: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            sub_district_id: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            village_id: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            integration_type: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            integration_client_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            location: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            external_properties: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            // entity_type flatten
            entity_type_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            entity_type_name: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            entity_type_integration_type: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            entity_type_external_properties: {
                type: Sequelize.JSON,
                allowNull: true,
            },
        });

        // Indexes
        await queryInterface.addIndex('entities', ['id']);
        await queryInterface.addIndex('entities', ['name']);
        await queryInterface.addIndex('entities', ['province_id']);
        await queryInterface.addIndex('entities', ['village_id']);

        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                allowNull: false,
            },
            user_uuid: {
                type: Sequelize.UUID,
                allowNull: false,
            },
            entity_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            firstname: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            lastname: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING(150),
                allowNull: true,
                unique: true,
            },
            username: {
                type: Sequelize.STRING(100),
                allowNull: true,
                unique: true,
            },
            mobile_phone: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            gender: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            gender_label: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            date_of_birth: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            role: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            role_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            role_label: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            view_only: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            last_device: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            last_login: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            integration_client_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            keycloak_uuid: {
                type: Sequelize.UUID,
                allowNull: true,
            },
            external_roles: {
                type: Sequelize.STRING, // array → simpan string join
                allowNull: true,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            manufacture_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            village_id: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            external_properties: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            created_by: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },
            updated_by: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },
            deleted_by: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },
        });

        // Indexes
        await queryInterface.addIndex('users', ['id']);
        await queryInterface.addIndex('users', ['user_uuid']);
        await queryInterface.addIndex('users', ['entity_id']);
        await queryInterface.addIndex('users', ['email']);
        await queryInterface.addIndex('users', ['username']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
        await queryInterface.dropTable('entities');
    },
};
