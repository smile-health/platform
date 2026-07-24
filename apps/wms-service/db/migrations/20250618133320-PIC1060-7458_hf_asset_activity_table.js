'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('healthcare_facility_asset_activity', {
            hf_asset_id: {
                type: Sequelize.BIGINT.UNSIGNED,
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
            operator_id: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            activity_type: {
                type: Sequelize.ENUM('MAINTENANCE', 'CALIBRATION'),
                allowNull: false,
            },
        });

        await queryInterface.addIndex('healthcare_facility_asset_activity', ['hf_asset_id'], {
            name: 'hf_asset_id',
            using: 'BTREE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('healthcare_facility_asset_activity');
    },
};
