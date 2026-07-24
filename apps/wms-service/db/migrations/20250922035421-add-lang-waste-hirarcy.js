'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_hierarchy', 'name_en', {
            type: Sequelize.STRING(64),
            allowNull: false,
            defaultValue: '',
        });

        await queryInterface.addColumn('waste_hierarchy', 'description_en', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_hierarchy', 'name_en');
        await queryInterface.removeColumn('waste_hierarchy', 'description_en');
    },
};
