'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_bag', 'bin_number', {
            type: Sequelize.STRING(50),
            allowNull: true,
        });
        await queryInterface.addColumn('waste_bag', 'iot_method', {
            type: Sequelize.ENUM('BLUETOOTH', 'INTERNET'),
            allowNull: true,
        });
        await queryInterface.addColumn('waste_bag', 'manifest_doc_number', {
            type: Sequelize.STRING(50),
            allowNull: true,
        });
        await queryInterface.addColumn('waste_bag', 'manifest_doc_path', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_bag', 'bin_number');
        await queryInterface.removeColumn('waste_bag', 'iot_method');
        await queryInterface.removeColumn('waste_bag', 'manifest_doc_number');
        await queryInterface.removeColumn('waste_bag', 'manifest_doc_path');
    },
};
