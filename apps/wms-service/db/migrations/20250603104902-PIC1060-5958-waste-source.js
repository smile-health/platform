'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.dropTable('waste_source_group');
        await queryInterface.dropTable('waste_source');

        await queryInterface.createTable(
            'waste_source',
            {
                id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                },
                created_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                updated_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                created_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                updated_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                healthcare_facility_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                source_type: {
                    type: Sequelize.ENUM('INTERNAL', 'EXTERNAL', 'INTERNAL_TREATMENT'),
                    allowNull: false,
                    defaultValue: 'INTERNAL',
                },
                internal_source_name: {
                    type: Sequelize.STRING(64),
                    allowNull: true,
                },
                internal_treatment_name: {
                    type: Sequelize.ENUM('PYROLYSIS', 'DISINFECTION'),
                    allowNull: true,
                },
                external_healthcare_facility_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                is_active: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                charset: 'utf8',
                collate: 'utf8_general_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('waste_source');
        await queryInterface.createTable(
            'waste_source_group',
            {
                id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                },
                created_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                updated_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                created_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                updated_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                healthcare_facility_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                name: {
                    type: Sequelize.STRING(64),
                    allowNull: false,
                },
                description: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                is_active: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                charset: 'utf8',
                collate: 'utf8_general_ci',
            },
        );

        await queryInterface.createTable(
            'waste_source',
            {
                id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                },
                created_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                updated_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                created_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                updated_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                waste_source_group_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                name: {
                    type: Sequelize.STRING(64),
                    allowNull: false,
                },
                description: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                is_active: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                charset: 'utf8',
                collate: 'utf8_general_ci',
            },
        );
    },
};
