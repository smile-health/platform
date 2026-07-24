'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('scheduled_events', 'status', {
            allowNull: false,
            type: Sequelize.ENUM('PENDING', 'IN_PROGRESS', 'FAILED'),
            defaultValue: 'PENDING',
        });
        await queryInterface.addColumn('scheduled_events', 'retry_left', {
            allowNull: true,
            type: Sequelize.INTEGER,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('scheduled_events', 'status');
        await queryInterface.removeColumn('scheduled_events', 'retry_left');
    },
};
