'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('scheduled_events', {
            fields: ['scheduled_at'],
            name: 'idx_scheduled_at',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('scheduled_events', 'idx_scheduled_at');
    },
};
