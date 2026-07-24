'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_transportation_group', 'transporter_vehicle_id', {
            type: Sequelize.STRING(32),
            allowNull: true,
        });

        await queryInterface.changeColumn('waste_transportation_group', 'transporter_operator_id', {
            type: Sequelize.STRING(36),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_transportation_group', 'transporter_vehicle_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.changeColumn('waste_transportation_group', 'transporter_operator_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },
};
