'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('asset_data', 'asset_id_UNIQUE');
        await queryInterface.removeConstraint('scale_data', 'asset_id_UNIQUE');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addConstraint('asset_data', {
            fields: ['asset_id'],
            type: 'unique',
            name: 'asset_id_UNIQUE',
        });
        await queryInterface.addConstraint('scale_data', {
            fields: ['asset_id'],
            type: 'unique',
            name: 'asset_id_UNIQUE',
        });
    },
};
