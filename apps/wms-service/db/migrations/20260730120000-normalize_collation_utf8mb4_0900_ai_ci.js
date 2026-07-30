'use strict';

// Schema drifted between utf8mb4_general_ci (MariaDB-era tables/dump) and
// utf8mb4_0900_ai_ci (MySQL 8 server default), causing "Illegal mix of
// collations" on joins/comparisons across the two groups. This normalizes
// every app table onto utf8mb4_0900_ai_ci, matching the MySQL 8 database default.
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
    'notification',
    'partner_vehicle',
    'partnership',
    'partnership_operator_map',
    'permission',
    'qr_code_config',
    'region',
    'scheduled_events',
    'user_fcm_token',
    'user_role',
    'user_role_permission_map',
    'users',
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
            await queryInterface.sequelize.query(
                `ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
            );
        }
    },

    async down() {
        // Not reversible to a meaningful prior state — the pre-migration state
        // was itself a broken mix of collations across these tables.
    },
};
