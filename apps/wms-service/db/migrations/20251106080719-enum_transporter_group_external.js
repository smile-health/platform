'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'transportation_status',
            {
                type: Sequelize.ENUM(
                    'READY_FOR_TRANSPORT',
                    'TRANSPORTATION_REQUEST_CREATED',
                    'IN_TRANSIT',
                ),
                allowNull: false,
                defaultValue: 'READY_FOR_TRANSPORT',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'transportation_status',
            {
                type: Sequelize.ENUM('IN_TRANSIT'),
                allowNull: false,
                defaultValue: 'IN_TRANSIT',
            },
        );
    },
};
