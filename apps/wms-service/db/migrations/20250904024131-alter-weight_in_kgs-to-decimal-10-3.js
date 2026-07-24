'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag', 'weight_in_kgs', {
            type: Sequelize.DECIMAL(10, 3),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag', 'weight_in_kgs', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
        });
    },
};
