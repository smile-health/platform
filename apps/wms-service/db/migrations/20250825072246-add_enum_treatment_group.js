'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_treatment_external_group',
            'transportation_status',
            {
                type: Sequelize.ENUM(
                    'STORED_FOR_TREATMENT',
                    'READY_FOR_TREATMENT',
                    'INCINERATION_IN_PROCESS',
                    'STERILIZATION_IN_PROCESS',
                    'INCINERATED',
                    'STERILISED',
                    'LANDFILLED',
                    'RECYCLED',
                    'DISPOSED',
                    'COLLECTED',
                ),
                allowNull: false,
                defaultValue: 'STORED_FOR_TREATMENT',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_treatment_external_group',
            'transportation_status',
            {
                type: Sequelize.ENUM(
                    'READY_FOR_TREATMENT',
                    'INCINERATION_IN_PROCESS',
                    'STERILIZATION_IN_PROCESS',
                    'INCINERATED',
                    'STERILISED',
                    'LANDFILLED',
                    'RECYCLED',
                    'DISPOSED',
                    'COLLECTED',
                ),
                allowNull: false,
                defaultValue: 'STORED_FOR_TREATMENT',
            },
        );
    },
};
