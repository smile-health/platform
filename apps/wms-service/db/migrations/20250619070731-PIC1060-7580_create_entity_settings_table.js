'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('entity_settings', {
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
            entity_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            setting_name: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            setting_value: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
        });

        await queryInterface.addIndex('entity_settings', {
            name: 'entity_setting_unique',
            unique: true,
            fields: ['entity_id', 'setting_name'],
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('entity_settings');
    },
};
