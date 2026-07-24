'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_treatment_external_group',
            'treatment_operator_id',
            {
                type: Sequelize.STRING(36),
                allowNull: true,
            },
        );
        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'treatment_operator_id',
            {
                type: Sequelize.STRING(36),
                allowNull: true,
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_treatment_external_group',
            'treatment_operator_id',
            {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
        );
        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'treatment_operator_id',
            {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
        );
    },
};
