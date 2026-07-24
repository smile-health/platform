'use strict';

const tables_with_created_by = [
    'asset_manufacturer',
    'asset_model',
    'healthcare_facility_asset',
    'healthcare_facility_settings',
    'partner_vehicle',
    'partnership',
    'permission',
    'qr_code_config',
    'region',
    'user_role',
    'user_role_permission_map',
    'waste_audit_log',
    'waste_bag',
    'waste_bag_qr_code',
    'waste_classification',
    'waste_hierarchy',
    'waste_source',
    'waste_source_group',
    'waste_transportation_group',
    'waste_transportation_request',
    'waste_treatment_group',
    'waste_treatment_request',
];

const tables_with_updated_by = [
    'asset_manufacturer',
    'asset_model',
    'healthcare_facility_asset',
    'healthcare_facility_settings',
    'partner_vehicle',
    'partnership',
    'permission',
    'qr_code_config',
    'region',
    'user_role',
    'user_role_permission_map',
    'waste_bag',
    'waste_classification',
    'waste_hierarchy',
    'waste_source',
    'waste_source_group',
    'waste_transportation_group',
    'waste_transportation_request',
    'waste_treatment_group',
    'waste_treatment_request',
];

const PREVIOUS_LENGTH = 32;
const UUID_LENGTH = 36;
const nullable_updated_by = 'waste_bag';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        for (const table of tables_with_created_by) {
            await queryInterface.changeColumn(table, 'created_by', {
                type: Sequelize.STRING(UUID_LENGTH),
                allowNull: false,
            });
        }
        for (const table of tables_with_updated_by) {
            await queryInterface.changeColumn(table, 'updated_by', {
                type: Sequelize.STRING(UUID_LENGTH),
                allowNull: table === nullable_updated_by,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        for (const table of tables_with_created_by) {
            await queryInterface.changeColumn(table, 'created_by', {
                type: Sequelize.STRING(PREVIOUS_LENGTH),
                allowNull: false,
            });
        }
        for (const table of tables_with_updated_by) {
            await queryInterface.changeColumn(table, 'updated_by', {
                type: Sequelize.STRING(PREVIOUS_LENGTH),
                allowNull: table === nullable_updated_by,
            });
        }
    },
};
