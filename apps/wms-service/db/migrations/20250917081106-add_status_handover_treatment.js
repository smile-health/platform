'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag', 'waste_status', {
            type: Sequelize.ENUM(
                'INTERNAL_LANDFILL_IN_PROCESS',
                'INTERNAL_LANDFILLED',
                'IN_TEMPORARY_STORAGE',
                'IN_COLD_STORAGE',
                'INCINERATION_IN_PROCESS',
                'STERILIZATION_IN_PROCESS',
                'INCINERATED',
                'STERILISED',
                'READY_FOR_TRANSPORT',
                'TRANSPORTATION_REQUEST_CREATED',
                'IN_TRANSIT',
                'HANDOVER_TO_TREATMENT',
                'READY_FOR_TREATMENT',
                'IN_THIRD_PARTY_STORAGE',
                'RECYCLED',
                'LANDFILLED',
                'COLLECTED',
                'DISPOSED',
            ),
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
        });

        await queryInterface.changeColumn(
            'waste_treatment_external_group',
            'transportation_status',
            {
                type: Sequelize.ENUM(
                    'STORED_FOR_TREATMENT',
                    'READY_FOR_TREATMENT',
                    'IN_THIRD_PARTY_STORAGE',
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
        await queryInterface.changeColumn('waste_bag', 'waste_status', {
            type: Sequelize.ENUM(
                'INTERNAL_LANDFILL_IN_PROCESS',
                'INTERNAL_LANDFILLED',
                'IN_TEMPORARY_STORAGE',
                'IN_COLD_STORAGE',
                'INCINERATION_IN_PROCESS',
                'STERILIZATION_IN_PROCESS',
                'INCINERATED',
                'STERILISED',
                'READY_FOR_TRANSPORT',
                'TRANSPORTATION_REQUEST_CREATED',
                'IN_TRANSIT',
                'READY_FOR_TREATMENT',
                'RECYCLED',
                'LANDFILLED',
                'COLLECTED',
                'DISPOSED',
            ),
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
        });

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
};
