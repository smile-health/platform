'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.addColumn('entities', 'is_active', {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true,
            }),

            queryInterface.addColumn('users', 'is_active', {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.removeColumn('entities', 'is_active'),
            queryInterface.removeColumn('users', 'is_active'),
        ]);
    },
};
