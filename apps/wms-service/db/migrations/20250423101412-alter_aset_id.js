'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add UNIQUE constraint to asset_id
        await queryInterface.addConstraint('healthcare_facility_asset', {
            fields: ['asset_id'],
            type: 'unique',
            name: 'unique_asset_id', // this will be the name of the constraint
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove UNIQUE constraint from asset_id
        await queryInterface.removeConstraint('healthcare_facility_asset', 'unique_asset_id');
    },
};
