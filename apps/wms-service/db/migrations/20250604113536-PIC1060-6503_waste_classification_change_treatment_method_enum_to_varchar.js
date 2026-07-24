'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_classification', 'treatment_method', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_classification', 'treatment_method', {
            type: Sequelize.ENUM('PYROLYSIS', 'DISINFECTION'),
            allowNull: true,
        });
    },
};
