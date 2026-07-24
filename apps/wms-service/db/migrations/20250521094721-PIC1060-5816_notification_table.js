'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('notification', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            created_by: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            target_user_id: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            sender_type: {
                type: Sequelize.ENUM('HEALTHCARE_FACILITY', 'TRANSPORTER'),
                allowNull: false,
            },
            healthcare_facility_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            transporter_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            notification_type: {
                type: Sequelize.ENUM(
                    'TRANSPORTATION_REQUEST',
                    'TRANSPORTATION_REQUEST_ACCEPTED',
                    'TRANSPORTATION_REQUEST_REJECTED',
                    'TREATMENT_REQUEST',
                    'TREATMENT_REQUEST_ACCEPTED',
                    'TREATMENT_REQUEST_REJECTED',
                    'STORAGE_OVERDUE',
                    'OTHER',
                ),
                allowNull: false,
                defaultValue: 'OTHER',
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            payload: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            channel: {
                type: Sequelize.ENUM('EMAIL', 'SMS', 'PUSH_NOTIFICATION'),
                allowNull: false,
            },
            delivery_status: {
                type: Sequelize.ENUM('PENDING', 'SENT', 'FAILED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            last_attempt_at: {
                type: Sequelize.DATE(3),
                allowNull: true,
            },
        });

        await queryInterface.addIndex('notification', ['target_user_id'], {
            name: 'target_user_id',
            using: 'BTREE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('notification');
    },
};
