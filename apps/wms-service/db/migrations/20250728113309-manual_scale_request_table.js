'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('manual_scale_request', {
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
            requested_by: {
                type: Sequelize.STRING(32),
                allowNull: false,
            },
            processed_by: {
                type: Sequelize.STRING(32),
                allowNull: false,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            approval_type: {
                type: Sequelize.ENUM('TIME_BOUND', 'COUNT_BASED'),
                allowNull: true,
            },
            valid_until: {
                type: Sequelize.DATE(3),
                allowNull: true,
            },
            count_limit: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
            },
        });

        await queryInterface.addIndex('manual_scale_request', {
            fields: ['requested_by'],
            name: 'manual_scale_request_requested_by',
        });

        await queryInterface.addIndex('manual_scale_request', {
            fields: ['created_at'],
            name: 'manual_scale_request_created_at',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('manual_scale_request');
    },
};
