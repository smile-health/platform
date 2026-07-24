'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_transportation_group', 'transporter_vehicle_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        });

        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'transporter_vehicle_id',
            {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_transportation_group', 'transporter_vehicle_id', {
            type: Sequelize.STRING(32),
            allowNull: true,
        });

        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'transporter_vehicle_id',
            {
                type: Sequelize.STRING(32),
                allowNull: true,
            },
        );
    },
};
