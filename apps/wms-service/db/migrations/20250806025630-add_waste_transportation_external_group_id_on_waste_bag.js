'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_bag', 'waste_transportation_external_group_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.addIndex('waste_bag', {
            fields: ['waste_transportation_external_group_id'],
            name: 'waste_bag_waste_transportation_external_group_id',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('waste_bag', 'waste_transportation_external_group_id');
    },
};
