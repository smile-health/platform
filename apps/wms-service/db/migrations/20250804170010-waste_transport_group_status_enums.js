'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add incinerated as a treatment status
        await queryInterface.changeColumn('waste_transportation_group', 'transportation_status', {
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
                'READY_FOR_TRANSPORT',
            ),
        });

        await queryInterface.bulkUpdate('waste_transportation_group', {
            transportation_status: 'READY_FOR_TRANSPORT',
        });

        // Replace status enums
        await queryInterface.changeColumn('waste_transportation_group', 'transportation_status', {
            type: Sequelize.ENUM('READY_FOR_TRANSPORT', 'TRANSPORTATION_REQUEST_CREATED'),
            allowNull: false,
            defaultValue: 'READY_FOR_TRANSPORT',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_transportation_group', 'transportation_status', {
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
                'READY_FOR_TRANSPORT',
            ),
            allowNull: false,
            defaultValue: 'STORED_FOR_TRANSPORT',
        });
    },
};
