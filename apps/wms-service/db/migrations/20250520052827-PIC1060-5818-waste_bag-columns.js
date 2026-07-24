'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag', 'waste_status', {
            type: Sequelize.ENUM(
                'CREATED',
                'SCALED',
                'IN_TEMPORARY_STORAGE',
                'IN_COLD_STORAGE',
                'AUTOCLAVED',
                'INCINERATED',
                'READY_FOR_TRANSPORT',
                'IN_TRANSIT',
                'TREATED',
                'RECYCLED',
                'LANDFILLED',
                'COLLECTED_GOVERNMENT',
                'DISPOSED',
            ),
            defaultValue: 'CREATED',
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_bag', 'waste_status_updated_by', {
            type: Sequelize.STRING(36),
            allowNull: true,
        });
        await queryInterface.addColumn('waste_bag', 'transportation_status', {
            type: Sequelize.ENUM('REQUESTED', 'IN_TRANSIT', 'HANDED_OVER'),
            allowNull: true,
            after: 'waste_status_updated_by',
        });
        await queryInterface.addColumn('waste_bag', 'transportation_status_updated_at', {
            type: Sequelize.DATE(3),
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            after: 'transportation_status',
        });
        await queryInterface.addColumn('waste_bag', 'transportation_status_updated_by', {
            type: Sequelize.STRING(36),
            allowNull: true,
            after: 'transportation_status_updated_at',
        });
        await queryInterface.addColumn('waste_bag', 'owned_by', {
            type: Sequelize.ENUM('HEALTHCARE_FACILITY', 'TRANSPORTER', 'THIRD_PARTY'),
            allowNull: false,
            defaultValue: 'HEALTHCARE_FACILITY',
            after: 'transportation_status_updated_by',
        });
        await queryInterface.addColumn('waste_bag', 'transporter_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            after: 'owned_by',
        });
        await queryInterface.addColumn('waste_bag', 'third_party_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            after: 'transporter_id',
        });
        await queryInterface.addColumn('waste_bag', 'is_treated', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            after: 'third_party_id',
        });
        await queryInterface.addColumn('waste_bag', 'is_disposed', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            after: 'is_treated',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag', 'waste_status', {
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
            ),
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_bag', 'waste_status_updated_by', {
            type: Sequelize.STRING(32),
            allowNull: true,
        });
        await queryInterface.removeColumn('waste_bag', 'transportation_status');
        await queryInterface.removeColumn('waste_bag', 'transportation_status_updated_at');
        await queryInterface.removeColumn('waste_bag', 'transportation_status_updated_by');
        await queryInterface.removeColumn('waste_bag', 'owned_by');
        await queryInterface.removeColumn('waste_bag', 'transporter_id');
        await queryInterface.removeColumn('waste_bag', 'third_party_id');
        await queryInterface.removeColumn('waste_bag', 'is_treated');
        await queryInterface.removeColumn('waste_bag', 'is_disposed');
    },
};
