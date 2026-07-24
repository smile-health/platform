'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('partner_vehicle', 'transporter_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('partner_vehicle', 'transporter_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },
};
