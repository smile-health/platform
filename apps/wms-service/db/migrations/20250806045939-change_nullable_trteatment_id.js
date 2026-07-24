'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_treatment_external_group',
            'treatment_provider_id',
            {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
        );
        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'treatment_provider_id',
            {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_treatment_external_group',
            'treatment_provider_id',
            {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
            },
        );
        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'treatment_provider_id',
            {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
            },
        );
    },
};
