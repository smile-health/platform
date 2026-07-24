'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('global_settings', {
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
            setting_name: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            setting_value: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
        });

        await queryInterface.addIndex('global_settings', {
            name: 'setting_name_unique',
            unique: true,
            fields: ['setting_name'],
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('global_settings');
    },
};
