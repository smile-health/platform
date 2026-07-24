'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await Promise.allSettled([
            queryInterface.changeColumn('waste_bag_collection', 'waste_in_kgs', {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            }),
            queryInterface.changeColumn('waste_bag_collection', 'updated_by', {
                type: Sequelize.STRING(32),
                allowNull: true,
            }),
            queryInterface.changeColumn('waste_bag_collection', 'updated_at', {
                type: Sequelize.DATE,
                allowNull: true,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.allSettled([
            queryInterface.changeColumn('waste_bag_collection', 'waste_in_kgs', {
                type: Sequelize.INTEGER,
                allowNull: true,
            }),
            queryInterface.changeColumn('waste_bag_collection', 'updated_by', {
                type: Sequelize.STRING(32),
                allowNull: false,
            }),
            queryInterface.changeColumn('waste_bag_collection', 'updated_at', {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: null,
            }),
        ]);
    },
};
