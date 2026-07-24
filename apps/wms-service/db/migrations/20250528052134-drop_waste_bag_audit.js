'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.dropTable('waste_audit_log');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.createTable('waste_audit_log', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            created_by: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            audit_type: {
                type: Sequelize.ENUM('TRANSACTION', 'TREATMENT_GROUP', 'TRANSPORTATION_GROUP'),
                allowNull: false,
            },
            action_type: {
                type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE'),
                allowNull: false,
            },
            from_status: {
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
            },
            to_status: {
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
            },
            reason: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            data: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            workflow_engine_command: {
                type: Sequelize.STRING(64),
                allowNull: true,
            },
            reference_table_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
        });
    },
};
