'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('manual_scale_request', 'entity_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });

        await queryInterface.addIndex('manual_scale_request', {
            fields: ['entity_id'],
            name: 'manual_scale_request_entity_id',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('manual_scale_request', 'entity_id');
    },
};
