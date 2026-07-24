'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_bag', 'waste_group_ids', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addIndex('waste_bag', {
            fields: ['waste_group_ids'],
            name: 'waste_bag_waste_group_ids',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('waste_bag', 'waste_group_ids');
    },
};
