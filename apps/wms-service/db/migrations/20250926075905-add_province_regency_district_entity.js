'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('entities', 'province_name', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
        await queryInterface.addColumn('entities', 'regency_name', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
        await queryInterface.addColumn('entities', 'district_name', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('entities', 'province_name');
        await queryInterface.removeColumn('entities', 'regency_name');
        await queryInterface.removeColumn('entities', 'district_name');
    },
};
