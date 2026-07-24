'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('entity_location', 'province_name', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await queryInterface.addColumn('entity_location', 'city_name', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('entity_location', 'province_name');
        await queryInterface.removeColumn('entity_location', 'city_name');
    },
};
