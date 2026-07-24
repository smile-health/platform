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
        await Promise.all(
            TABLES.flatMap((table) => [
                queryInterface.sequelize.query(
                    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL`,
                ),
                queryInterface.sequelize.query(
                    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS deleted_by BIGINT NULL`,
                ),
            ]),
        );
    },

    async down(queryInterface) {
        await Promise.all(
            TABLES.flatMap((table) => [
                queryInterface.sequelize.query(
                    `ALTER TABLE ${table} DROP COLUMN IF EXISTS deleted_at`,
                ),
                queryInterface.sequelize.query(
                    `ALTER TABLE ${table} DROP COLUMN IF EXISTS deleted_by`,
                ),
            ]),
        );
    },
};
