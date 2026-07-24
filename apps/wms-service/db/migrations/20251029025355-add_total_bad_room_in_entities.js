'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.addColumn('entities', 'total_bad_room', {
                type: Sequelize.INTEGER, // atau Sequelize.BIGINT kalau datanya bisa besar
                allowNull: true,
            }),

            queryInterface.addColumn('entities', 'percentage_bad_room', {
                type: Sequelize.DECIMAL(7, 2),
                allowNull: true,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.removeColumn('entities', 'total_bad_room'),
            queryInterface.removeColumn('entities', 'percentage_bad_room'),
        ]);
    },
};
