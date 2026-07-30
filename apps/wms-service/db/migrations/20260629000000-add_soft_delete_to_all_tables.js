'use strict';

// users table already has deleted_at and deleted_by columns — excluded
const TABLES = [
    'asset_dongle',
    'asset_manufacturer',
    'asset_model',
    'disposal',
    'disposal_items',
    'entities',
    'entity_location',
    'entity_settings',
    'global_settings',
    'healthcare_asset',
    'healthcare_facility_asset',
    'healthcare_facility_asset_activity',
    'manual_scale_request',
    'partner_vehicle',
    'partnership',
    'partnership_operator_map',
    'partnership_vehicle_map',
    'qr_code_config',
    'region',
    'scheduled_events',
    'user_fcm_token',
    'user_role',
    'waste_bag',
    'waste_bag_audit_trail',
    'waste_bag_qr_code',
    'waste_bag_record',
    'waste_classification',
    'waste_hierarchy',
    'waste_source',
    'waste_transportation_external_group',
    'waste_transportation_group',
    'waste_transportation_request',
    'waste_treatment_external_group',
    'waste_treatment_group',
    'waste_treatment_request',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        for (const table of TABLES) {
            const columns = await queryInterface.describeTable(table);
            if (!columns.deleted_at) {
                await queryInterface.addColumn(table, 'deleted_at', {
                    type: 'TIMESTAMP',
                    allowNull: true,
                });
            }
            if (!columns.deleted_by) {
                await queryInterface.addColumn(table, 'deleted_by', {
                    type: 'BIGINT',
                    allowNull: true,
                });
            }
        }
    },

    async down(queryInterface) {
        for (const table of TABLES) {
            const columns = await queryInterface.describeTable(table);
            if (columns.deleted_at) {
                await queryInterface.removeColumn(table, 'deleted_at');
            }
            if (columns.deleted_by) {
                await queryInterface.removeColumn(table, 'deleted_by');
            }
        }
    },
};
