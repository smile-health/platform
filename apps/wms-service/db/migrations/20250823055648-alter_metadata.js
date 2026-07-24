'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('scheduled_events', 'metadata', {
            type: Sequelize.STRING(1000),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('scheduled_events', 'metadata', {
            type: Sequelize.STRING(255),
            allowNull: false,
        });
    },
};
