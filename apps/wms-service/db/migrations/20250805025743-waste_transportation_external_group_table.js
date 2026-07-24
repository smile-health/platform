'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('waste_transportation_external_group', {
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
            transporter_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            transporter_vehicle_id: {
                type: Sequelize.STRING(32),
                allowNull: true,
            },
            transporter_operator_id: {
                type: Sequelize.STRING(36),
                allowNull: true,
            },
            treatment_provider_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            treatment_operator_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            handover_lattitude: {
                type: Sequelize.FLOAT(10, 6),
                allowNull: true,
            },
            handover_longitude: {
                type: Sequelize.FLOAT(10, 6),
                allowNull: true,
            },
            handover_timestamp: {
                type: Sequelize.DATE(3),
                allowNull: true,
            },
            transportation_status: {
                type: Sequelize.ENUM('IN_TRANSIT'),
                allowNull: false,
                defaultValue: 'IN_TRANSIT',
            },
            is_read_only: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        });

        await queryInterface.addIndex('waste_transportation_external_group', {
            fields: ['transporter_id'],
            name: 'waste_transportation_external_group_transporter_id',
        });

        await queryInterface.addIndex('waste_transportation_external_group', {
            fields: ['created_at'],
            name: 'waste_transportation_external_group_created_at',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            'waste_transportation_external_group',
            'waste_transportation_external_group_transporter_id',
        );
        await queryInterface.removeIndex(
            'waste_transportation_external_group',
            'waste_transportation_external_group_created_at',
        );
        await queryInterface.dropTable('waste_transportation_external_group');
    },
};
