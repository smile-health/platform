'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove UNIQUE constraint from asset_id
        await queryInterface.removeConstraint('healthcare_facility_asset', 'unique_asset_id');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addConstraint('healthcare_facility_asset', {
            fields: ['asset_id'],
            type: 'unique',
            name: 'unique_asset_id', // this will be the name of the constraint
        });
    },
};
