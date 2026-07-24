'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_transportation_external_group', 'transporter_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_transportation_external_group', 'transporter_id', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
        });
    },
};
