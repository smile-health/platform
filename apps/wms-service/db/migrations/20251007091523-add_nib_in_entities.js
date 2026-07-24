'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.addColumn('entities', 'updated_at', {
                type: Sequelize.DATE,
                allowNull: true,
            }),

            queryInterface.addColumn('entities', 'code', {
                type: Sequelize.STRING(32),
                allowNull: true,
            }),

            queryInterface.addColumn('entities', 'nib', {
                type: Sequelize.STRING(64),
                allowNull: true,
            }),

            queryInterface.addColumn('entities', 'head_name', {
                type: Sequelize.STRING(100),
                allowNull: true,
            }),

            queryInterface.addColumn('entities', 'email', {
                type: Sequelize.STRING(100),
                allowNull: true,
            }),

            queryInterface.addColumn('entities', 'gender', {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'Gender: 1 = male, 0 = female',
            }),

            queryInterface.addColumn('entities', 'mobile_phone', {
                type: Sequelize.STRING(32),
                allowNull: true,
            }),

            queryInterface.addColumn('entities', 'latitude', {
                type: Sequelize.DECIMAL(10, 6),
                allowNull: true,
            }),

            queryInterface.addColumn('entities', 'longitude', {
                type: Sequelize.DECIMAL(10, 6),
                allowNull: true,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.removeColumn('entities', 'updated_at'),
            queryInterface.removeColumn('entities', 'code'),
            queryInterface.removeColumn('entities', 'nib'),
            queryInterface.removeColumn('entities', 'head_name'),
            queryInterface.removeColumn('entities', 'email'),
            queryInterface.removeColumn('entities', 'gender'),
            queryInterface.removeColumn('entities', 'mobile_phone'),
            queryInterface.removeColumn('entities', 'latitude'),
            queryInterface.removeColumn('entities', 'longitude'),
        ]);
    },
};
