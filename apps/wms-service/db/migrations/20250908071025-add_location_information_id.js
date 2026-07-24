'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_bag', 'treatment_location_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        });

        await queryInterface.addIndex('waste_bag', {
            fields: ['treatment_location_id'],
            name: 'waste_bag_treatment_location_id',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('waste_bag', 'treatment_location_id');
    },
};
