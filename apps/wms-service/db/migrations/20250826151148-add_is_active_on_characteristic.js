'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_classification', 'is_active', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        });
        await queryInterface.addColumn('waste_hierarchy', 'is_active', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_classification', 'is_active', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        });
        await queryInterface.removeColumn('waste_hierarchy', 'is_active');
    },
};
