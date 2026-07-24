'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('scheduled_events', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            created_by: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: 'SYSTEM',
            },
            event_type: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            scheduled_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            metadata: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('scheduled_events');
    },
};
