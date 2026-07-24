'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.dropTable('scale_data');
        await queryInterface.dropTable('transporter_operator_coodinates');
        await queryInterface.dropTable('waste_group_movement_audit');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.createTable('waste_group_movement_audit', {
            id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true },
            waste_bag_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
            group_type: {
                type: Sequelize.ENUM(
                    'INTERNAL_TREATMENT',
                    'EXTERNAL_TREATMENT',
                    'INTERNAL_TRANSPORTATION',
                    'EXTERNAL_TRANSPORTATION',
                ),
                allowNull: false,
            },
            group_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
            added_on: {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            removed_on: { type: Sequelize.DATE(3), allowNull: true, defaultValue: null },
        });

        await queryInterface.addIndex('waste_group_movement_audit', ['waste_bag_id'], {
            name: 'waste_group_movement_audit_waste_bag_id',
            using: 'BTREE',
        });

        await queryInterface.addIndex('waste_group_movement_audit', ['group_id'], {
            name: 'waste_group_movement_audit_group_id',
            using: 'BTREE',
        });

        await queryInterface.createTable('transporter_operator_coodinates', {
            id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true },
            timestamp: {
                type: 'TIMESTAMP(3)',
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            user_id: { type: Sequelize.STRING(36), allowNull: false },
            lattitude: { type: Sequelize.FLOAT(10, 6), allowNull: false },
            longitude: { type: Sequelize.FLOAT(10, 6), allowNull: false },
            ttl_in_seconds: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 300 },
        });

        await queryInterface.createTable('scale_data', {
            id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, autoIncrement: true, primaryKey: true },
            timestamp: {
                type: 'TIMESTAMP(3)',
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            asset_id: { type: Sequelize.STRING(32), allowNull: false },
            value: { type: 'FLOAT UNSIGNED ZEROFILL', allowNull: false },
        });
    },
};
