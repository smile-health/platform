'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeIndex('partner_vehicle', 'Unique Vehicle Number');
        await queryInterface.addIndex('partner_vehicle', ['vehicle_number'], {
            name: 'vehicle_number',
            unique: true,
            using: 'BTREE',
        });

        await queryInterface.addColumn('partner_vehicle', 'entity_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            after: 'updated_by',
        });

        await queryInterface.changeColumn('partner_vehicle', 'vehicle_type', {
            type: Sequelize.ENUM(
                'BOX_TRUCK',
                'REFRIGERATED_BOX_TRUCK',
                'OPEN_BODY_TRUCK',
                'TANKER',
                'HAZARDOUS_MATERIAL_TRUCK',
                'RADIOACTIVE_MATERIAL_TRUCK',
                'FLATBED_TRUCK',
                'LOADER_TRUCK',
                'TRAILER',
                'VAN',
            ),
            allowNull: false,
        });

        await queryInterface.removeColumn('partner_vehicle', 'is_approved');
        await queryInterface.removeColumn('partner_vehicle', 'approved_by');
        await queryInterface.removeColumn('partner_vehicle', 'approved_on');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('partner_vehicle', 'vehicle_number');
        await queryInterface.addIndex('partner_vehicle', ['vehicle_number'], {
            name: 'Unique Vehicle Number',
            unique: true,
            using: 'BTREE',
        });

        await queryInterface.removeColumn('partner_vehicle', 'entity_id');

        await queryInterface.changeColumn('partner_vehicle', 'vehicle_type', {
            type: Sequelize.ENUM('BOX', 'VAN'),
            allowNull: false,
        });

        await queryInterface.addColumn('partner_vehicle', 'is_approved', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'capacity_in_kgs',
        });

        await queryInterface.addColumn('partner_vehicle', 'approved_by', {
            type: Sequelize.STRING(32),
            allowNull: true,
            after: 'is_approved',
        });

        await queryInterface.addColumn('partner_vehicle', 'approved_on', {
            type: Sequelize.DATE(3),
            allowNull: true,
            after: 'approved_by',
        });
    },
};

// CREATE TABLE IF NOT EXISTS `partner_vehicle` (
//   `id` int unsigned NOT NULL AUTO_INCREMENT,
//   `created_at` datetime NOT NULL DEFAULT (now()),
//   `updated_at` datetime NOT NULL DEFAULT (now()),
//   `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
//   `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
//   `vehicle_type` enum('BOX','VAN') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
//   `vehicle_number` varchar(16) NOT NULL,
//   `capacity_in_kgs` int NOT NULL DEFAULT '1',
//   `is_approved` bit(1) NOT NULL DEFAULT (0),
//   `approved_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
//   `approved_on` datetime DEFAULT NULL,
//   PRIMARY KEY (`id`) USING BTREE,
//   UNIQUE KEY `Unique Vehicle Number` (`vehicle_number`) USING BTREE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
