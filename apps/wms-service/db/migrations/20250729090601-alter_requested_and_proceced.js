'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('manual_scale_request', 'requested_by', {
            type: Sequelize.STRING(36),
            allowNull: false,
        });
        await queryInterface.changeColumn('manual_scale_request', 'processed_by', {
            type: Sequelize.STRING(36),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('manual_scale_request', 'requested_by', {
            type: Sequelize.STRING(32),
            allowNull: false,
        });
        await queryInterface.changeColumn('manual_scale_request', 'processed_by', {
            type: Sequelize.STRING(32),
            allowNull: true,
        });
    },
};
