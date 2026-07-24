'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_source', 'external_healthcare_facility_name', {
            type: Sequelize.STRING(64),
            allowNull: true,
            after: 'external_healthcare_facility_id',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_source', 'external_healthcare_facility_name');
    },
};
