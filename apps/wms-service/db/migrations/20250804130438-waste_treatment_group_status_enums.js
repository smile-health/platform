'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add incinerated as a treatment status
        await queryInterface.changeColumn('waste_treatment_group', 'treatment_status', {
            type: Sequelize.ENUM(
                'GENERATED',
                'CLASSIFIED',
                'SCALED',
                'STORED_FOR_TREATMENT',
                'STORED_FOR_TRANSPORT',
                'TREATED',
                'RESIDUE_CLASSIFIED',
                'RESIDUE_SCALED',
                'RESIDUE_STORED_FOR_TRANSPORT',
                'IN_TRANSIT',
                'DISPOSED',
                'INCINERATED',
            ),
        });

        await queryInterface.bulkUpdate('waste_treatment_group', {
            treatment_status: 'INCINERATED',
        });

        // Replace status enums
        await queryInterface.changeColumn('waste_treatment_group', 'treatment_status', {
            type: Sequelize.ENUM(
                'IN_TEMPORARY_STORAGE',
                'IN_COLD_STORAGE',
                'INCINERATION_IN_PROCESS',
                'STERILIZATION_IN_PROCESS',
                'INCINERATED',
                'STERILISED',
            ),
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_treatment_group', 'treatment_status', {
            type: Sequelize.ENUM(
                'GENERATED',
                'CLASSIFIED',
                'SCALED',
                'STORED_FOR_TREATMENT',
                'STORED_FOR_TRANSPORT',
                'TREATED',
                'RESIDUE_CLASSIFIED',
                'RESIDUE_SCALED',
                'RESIDUE_STORED_FOR_TRANSPORT',
                'IN_TRANSIT',
                'DISPOSED',
                'INCINERATED',
            ),
        });
    },
};
