'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'waste_transportation_external_group',
            'waste_treatment_external_group_id',
            {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn(
            'waste_transportation_external_group',
            'waste_treatment_external_group_id',
        );
    },
};
