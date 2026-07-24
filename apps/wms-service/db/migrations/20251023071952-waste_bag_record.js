'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('waste_bag_record', {
            id: {
                autoIncrement: true,
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
            },
            created_by: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('now'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            updated_by: {
                type: Sequelize.STRING(36),
                allowNull: true,
            },
            waste_bag_qr_code_id: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true,
            },
            healthcare_facility_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            waste_source_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            waste_classification_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            source_treatment_group_id: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            scale_method: {
                type: Sequelize.ENUM('IOT', 'MANUAL'),
                allowNull: false,
                defaultValue: 'MANUAL',
            },
            asset_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            weight_in_kgs: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            storage_start_timestamp: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            scheduled_storage_end_datetime: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            actual_storage_end_timestamp: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            max_storage_hours: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            min_storage_hours: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            waste_treatment_group_id: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },
            waste_transportation_group_id: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },
            waste_status: {
                type: Sequelize.ENUM(
                    'INTERNAL_LANDFILL_IN_PROCESS',
                    'INTERNAL_LANDFILLED',
                    'IN_TEMPORARY_STORAGE',
                    'IN_COLD_STORAGE',
                    'INCINERATION_IN_PROCESS',
                    'STERILIZATION_IN_PROCESS',
                    'INCINERATED',
                    'STERILISED',
                    'READY_FOR_TRANSPORT',
                    'TRANSPORTATION_REQUEST_CREATED',
                    'IN_TRANSIT',
                    'READY_FOR_TREATMENT',
                    'STORED_FOR_TREATMENT',
                    'RECYCLED',
                    'LANDFILLED',
                    'COLLECTED',
                    'DISPOSED',
                ),
                allowNull: false,
                defaultValue: 'IN_TEMPORARY_STORAGE',
            },
            waste_status_updated_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.fn('now'),
            },
            waste_status_updated_by: {
                type: Sequelize.STRING(36),
                allowNull: true,
            },
            transportation_status: {
                type: Sequelize.ENUM('REQUESTED', 'IN_TRANSIT', 'HANDED_OVER'),
                allowNull: true,
            },
            transportation_status_updated_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.fn('now'),
            },
            transportation_status_updated_by: {
                type: Sequelize.STRING(36),
                allowNull: true,
            },
            owned_by: {
                type: Sequelize.ENUM('HEALTHCARE_FACILITY', 'TRANSPORTER', 'THIRD_PARTY'),
                allowNull: false,
                defaultValue: 'HEALTHCARE_FACILITY',
            },
            transporter_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            third_party_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            waste_treatment_external_group_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            waste_transportation_external_group_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            is_treated: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            is_disposed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            bin_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            iot_method: {
                type: Sequelize.ENUM('BLUETOOTH', 'INTERNET'),
                allowNull: true,
            },
            manifest_doc_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            manifest_doc_path: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            treatment_start_time: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            treatment_end_time: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            waste_group_ids: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            treatment_location_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            healthcare_facility_name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            province_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            regency_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            district_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            province_name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            regency_name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            district_name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            transporter_name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            third_party_name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            bast_no: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            material_ids: {
                type: Sequelize.STRING(64),
                allowNull: true,
            },
        });

        await queryInterface.addIndex('waste_bag_record', ['id'], {
            name: 'waste_bag_record_key_id',
            unique: true,
        });

        await queryInterface.addIndex('waste_bag_record', ['waste_bag_qr_code_id'], {
            name: 'waste_bag_record_qr_code_id',
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('waste_bag_record');
    },
};
