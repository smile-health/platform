'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_bag', 'treatment_start_time', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        await queryInterface.addColumn('waste_bag', 'treatment_end_time', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_bag', 'treatment_start_time');
        await queryInterface.removeColumn('waste_bag', 'treatment_end_time');
    },
};
