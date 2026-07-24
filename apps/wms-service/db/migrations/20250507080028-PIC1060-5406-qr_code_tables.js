'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.dropTable('waste_bag_label');

        await queryInterface.createTable(
            'qr_code_config',
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
                    type: Sequelize.STRING(32),
                    allowNull: false,
                },
                updated_by: {
                    type: Sequelize.STRING(32),
                    allowNull: false,
                },
                healthcare_facility_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                waste_source_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                waste_classification_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                label_count: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: false,
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        );

        await queryInterface.createTable(
            'waste_bag_qr_code',
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
                created_by: {
                    type: Sequelize.STRING(32),
                    allowNull: false,
                },
                healthcare_facility_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                waste_source_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                waste_classification_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                qr_code: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('qr_code_config');

        await queryInterface.createTable(
            'waste_bag_label',
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
                created_by: {
                    type: Sequelize.STRING(32),
                    allowNull: false,
                },
                waste_bag_collection_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                qr_code: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                },
                waste_label_purpose: {
                    type: Sequelize.ENUM('TRANSPORTATION', 'TREATMENT'),
                    allowNull: false,
                },
                waste_label_count: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: false,
                },
            },
            {
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            },
        );
    },
};
