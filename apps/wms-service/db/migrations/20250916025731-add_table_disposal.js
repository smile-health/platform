'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('disposal', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            entity_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            bast_no: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            created_name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            entity_name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
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
            approved_by: {
                type: Sequelize.STRING(36),
                allowNull: true,
            },
            approved_at: {
                type: Sequelize.DATE(3),
                allowNull: true,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            rejected_by: {
                type: Sequelize.STRING(36),
                allowNull: true,
            },
            rejected_at: {
                type: Sequelize.DATE(3),
                allowNull: true,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            rejected_reason: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
        });

        await queryInterface.addIndex('disposal', {
            fields: ['is_read'],
            name: 'idx_disposal_is_read',
        });

        await queryInterface.addIndex('disposal', {
            fields: ['created_at'],
            name: 'idx_disposal_created_at',
        });

        await queryInterface.addIndex('disposal', {
            fields: ['entity_id'],
            name: 'idx_disposal_entity_id',
        });

        await queryInterface.addIndex('disposal', {
            fields: ['bast_no'],
            name: 'idx_disposal_bast_no',
        });

        await queryInterface.addIndex('disposal', {
            fields: ['entity_name'],
            name: 'idx_disposal_entity_name',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('disposal', 'idx_disposal_bast_no');
        await queryInterface.removeIndex('disposal', 'idx_disposal_entity_id');
        await queryInterface.removeIndex('disposal', 'idx_disposal_created_at');
        await queryInterface.removeIndex('disposal', 'idx_disposal_is_read');
        await queryInterface.removeIndex('disposal', 'idx_disposal_entity_name');
        await queryInterface.dropTable('disposal');
    },
};
