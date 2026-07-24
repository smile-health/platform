'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_source', 'is_residue', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_source', 'is_residue');
    },
};
