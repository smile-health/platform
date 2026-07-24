'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('healthcare_facility_asset_activity', 'start_date', {
            type: Sequelize.DATEONLY,
            allowNull: true,
        });
        await queryInterface.addColumn('healthcare_facility_asset_activity', 'end_date', {
            type: Sequelize.DATEONLY,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('healthcare_facility_asset_activity', 'start_date');
        await queryInterface.removeColumn('healthcare_facility_asset_activity', 'end_date');
    },
};
