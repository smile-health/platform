const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_bag',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
            },
            created_by: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            updated_by: {
                type: DataTypes.STRING(36),
                allowNull: true,
            },
            waste_bag_qr_code_id: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: 'waste_bag_qr_code_id',
            },
            healthcare_facility_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            waste_source_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            waste_classification_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            source_treatment_group_id: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            scale_method: {
                type: DataTypes.ENUM('IOT', 'MANUAL'),
                allowNull: false,
                defaultValue: 'IOT',
            },
            asset_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            weight_in_kgs: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            storage_start_timestamp: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            scheduled_storage_end_datetime: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            actual_storage_end_timestamp: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            max_storage_hours: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            min_storage_hours: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            waste_treatment_group_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            waste_transportation_group_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            waste_status: {
                type: DataTypes.ENUM(
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
                    'IN_THIRD_PARTY_STORAGE',
                    'RECYCLED',
                    'LANDFILLED',
                    'COLLECTED',
                    'DISPOSED',
                ),
                allowNull: false,
                defaultValue: 'CREATED',
            },
            waste_status_updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: Sequelize.Sequelize.fn('now'),
            },
            waste_status_updated_by: {
                type: DataTypes.STRING(36),
                allowNull: true,
            },
            transportation_status: {
                type: DataTypes.ENUM('REQUESTED', 'IN_TRANSIT', 'HANDED_OVER'),
                allowNull: true,
            },
            transportation_status_updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: Sequelize.Sequelize.fn('now'),
            },
            transportation_status_updated_by: {
                type: DataTypes.STRING(36),
                allowNull: true,
            },
            owned_by: {
                type: DataTypes.ENUM('HEALTHCARE_FACILITY', 'TRANSPORTER', 'THIRD_PARTY'),
                allowNull: false,
                defaultValue: 'HEALTHCARE_FACILITY',
            },
            transporter_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            third_party_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            is_treated: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            is_disposed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            bin_number: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            iot_method: {
                type: DataTypes.ENUM('BLUETOOTH', 'INTERNET'),
                allowNull: true,
            },
            manifest_doc_number: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            manifest_doc_path: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            treatment_start_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            treatment_end_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'waste_bag',
            timestamps: true,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'id' }],
                },
                {
                    name: 'waste_bag_qr_code_id',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'waste_bag_qr_code_id' }],
                },
            ],
        },
    );
};
