'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('manual_scale_request', 'status', {
            type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'WAITING_FOR_APPROVAL'),
            allowNull: false,
            defaultValue: 'PENDING',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('manual_scale_request', 'status', {
            type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            allowNull: false,
            defaultValue: 'PENDING',
        });
    },
};
