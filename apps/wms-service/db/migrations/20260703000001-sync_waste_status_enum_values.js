'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const wasteStatusEnum = Sequelize.ENUM(
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
            'STORED_FOR_TREATMENT',
            'IN_THIRD_PARTY_STORAGE',
            'RECYCLED',
            'LANDFILLED',
            'COLLECTED',
            'DISPOSED',
        );

        await queryInterface.changeColumn('waste_bag', 'waste_status', {
            type: wasteStatusEnum,
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
        });

        await queryInterface.changeColumn('waste_bag_record', 'waste_status', {
            type: wasteStatusEnum,
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
        });
    },

    async down(queryInterface, Sequelize) {
        // NOTE: production has rows using HANDOVER_TO_TREATMENT / IN_THIRD_PARTY_STORAGE
        // (see H2/H3 in WMS_DB_Refactor_Priorities.pdf). Reverting this migration will fail
        // or truncate data if any such rows exist — reassign/backfill those rows before undoing.
        const wasteStatusEnum = Sequelize.ENUM(
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
            'STORED_FOR_TREATMENT',
            'RECYCLED',
            'LANDFILLED',
            'COLLECTED',
            'DISPOSED',
        );

        await queryInterface.changeColumn('waste_bag', 'waste_status', {
            type: wasteStatusEnum,
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
        });

        await queryInterface.changeColumn('waste_bag_record', 'waste_status', {
            type: wasteStatusEnum,
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
        });
    },
};
