'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_transportation_external_group', 'pickup_at', {
            type: Sequelize.DATE(3),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_transportation_external_group', 'pickup_at');
    },
};
