'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_fcm_token', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            entity_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            user_uuid: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            token: {
                type: Sequelize.STRING(500),
                allowNull: false,
                unique: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Add index for fcm token user uuid
        await queryInterface.addIndex('user_fcm_token', ['user_uuid']);

        // Add index for fcm token user id
        await queryInterface.addIndex('user_fcm_token', ['user_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_fcm_token');
    },
};
