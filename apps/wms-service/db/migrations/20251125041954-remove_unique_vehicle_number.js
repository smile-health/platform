'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove UNIQUE constraint from vehicle_number
        await queryInterface.removeConstraint('partner_vehicle', 'vehicle_number');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addConstraint('partner_vehicle', {
            fields: ['vehicle_number'],
            type: 'unique',
            name: 'unique_asset_id', // this will be the name of the constraint
        });
    },
};
