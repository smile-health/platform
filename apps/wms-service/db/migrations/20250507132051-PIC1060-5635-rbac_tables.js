'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_to_user_role_map');

        await queryInterface.renameTable('system_feature', 'permission');

        await queryInterface.renameTable(
            'user_role_system_feature_access',
            'user_role_permission_map',
        );
        await queryInterface.removeColumn('user_role_permission_map', 'access_type');
        await queryInterface.renameColumn(
            'user_role_permission_map',
            'system_feature_id',
            'permission_id',
        );
        await queryInterface.removeIndex(
            'user_role_permission_map',
            'user_role_id_system_feature_id',
        );
        await queryInterface.addIndex(
            'user_role_permission_map',
            ['user_role_id', 'permission_id'],
            {
                name: 'user_role_id_permission_id',
                unique: true,
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.createTable('user_to_user_role_map', {
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
            created_by: {
                type: Sequelize.STRING(32),
                allowNull: false,
            },
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            role_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
        });
        await queryInterface.addIndex('user_to_user_role_map', ['user_id', 'role_id'], {
            name: 'user_id_role_id',
            unique: true,
        });

        await queryInterface.renameTable('permission', 'system_feature');

        await queryInterface.renameTable(
            'user_role_permission_map',
            'user_role_system_feature_access',
        );
        await queryInterface.addColumn('user_role_system_feature_access', 'access_type', {
            type: Sequelize.ENUM('ALL', 'NONE', 'READ-ONLY', 'WRITE', 'DELETE'),
            allowNull: false,
            defaultValue: 'NONE',
        });
        await queryInterface.renameColumn(
            'user_role_system_feature_access',
            'permission_id',
            'system_feature_id',
        );
        await queryInterface.removeIndex(
            'user_role_system_feature_access',
            'user_role_id_permission_id',
        );
        await queryInterface.addIndex(
            'user_role_system_feature_access',
            ['user_role_id', 'system_feature_id'],
            {
                name: 'user_role_id_system_feature_id',
                unique: true,
            },
        );
    },
};
