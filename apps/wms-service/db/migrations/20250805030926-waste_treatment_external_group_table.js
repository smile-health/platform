'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('waste_treatment_external_group', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            created_at: {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            updated_at: {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            created_by: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            updated_by: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            total_bags_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            total_weight_in_kgs: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            source_external_transportation_group_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            treatment_provider_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            treatment_operator_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            transportation_status: {
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
                defaultValue: 'READY_FOR_TREATMENT',
            },
        });

        await queryInterface.addIndex('waste_treatment_external_group', {
            fields: ['treatment_provider_id'],
            name: 'waste_treatment_external_group_treatment_provider_id',
        });

        await queryInterface.addIndex('waste_treatment_external_group', {
            fields: ['created_at'],
            name: 'waste_treatment_external_group_created_at',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            'waste_treatment_external_group',
            'waste_treatment_external_group_treatment_provider_id',
        );
        await queryInterface.removeIndex(
            'waste_treatment_external_group',
            'waste_treatment_external_group_created_at',
        );
        await queryInterface.dropTable('waste_treatment_external_group');
    },
};
