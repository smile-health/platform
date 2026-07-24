'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_treatment_group', 'handover_timestamp', {
            type: Sequelize.DATE(3),
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.addColumn('waste_transportation_group', 'handover_timestamp', {
            type: Sequelize.DATE(3),
            allowNull: true,
            defaultValue: null,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_treatment_group', 'handover_timestamp');
        await queryInterface.removeColumn('waste_transportation_group', 'handover_timestamp');
    },
};
