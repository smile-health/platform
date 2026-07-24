'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('healthcare_facility_asset', 'warranty_end_date', {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'The date when the warranty for the asset ends',
        });
        await queryInterface.addColumn('healthcare_facility_asset', 'year_of_production', {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'The year when the asset was produced',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('healthcare_facility_asset', 'warranty_end_date');
        await queryInterface.removeColumn('healthcare_facility_asset', 'year_of_production');
    },
};
