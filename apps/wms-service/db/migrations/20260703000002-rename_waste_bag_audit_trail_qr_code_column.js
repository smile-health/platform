'use strict';

/**
 * Step 1 of an expand/contract rename for waste_bag_audit_trail.waste_bag_id
 * -> waste_bag_qr_code (see M2 in WMS_DB_Refactor_Priorities.pdf). A plain
 * renameColumn is unsafe here because wms-migrations and wms are deployed
 * independently: an instant rename would break any still-running old app
 * instance mid-rollout (it queries by the old column name). Instead:
 *
 *   1. (this migration) add the new column nullable, backfill existing rows.
 *   2. (app deploy) dual-write both columns on every write path; reads stay
 *      on waste_bag_id until the app has fully rolled out.
 *   3. (future migration, after a full deploy cycle with zero NULLs in the
 *      new column) cut reads over to waste_bag_qr_code, then drop
 *      waste_bag_id and its index.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_bag_audit_trail', 'waste_bag_qr_code', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.addIndex('waste_bag_audit_trail', {
            name: 'idx_waste_bag_qr_code',
            using: 'BTREE',
            fields: ['waste_bag_qr_code'],
        });

        await queryInterface.sequelize.query(
            'UPDATE waste_bag_audit_trail SET waste_bag_qr_code = waste_bag_id WHERE waste_bag_qr_code IS NULL',
        );
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('waste_bag_audit_trail', 'idx_waste_bag_qr_code');
        await queryInterface.removeColumn('waste_bag_audit_trail', 'waste_bag_qr_code');
    },
};
