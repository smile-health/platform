'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('entity_location', 'location_type', {
            type: Sequelize.ENUM('STORAGE', 'TREATMENT'),
            allowNull: true,
            defaultValue: 'STORAGE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('entity_location', 'location_type');
    },
};
