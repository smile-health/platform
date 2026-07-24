const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_bag_collection',
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
            healthcare_facility_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            waste_source_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            waste_classification_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            source_treatment_group_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            scale_method: {
                type: DataTypes.ENUM('IOT', 'MANUAL'),
                allowNull: false,
                defaultValue: 'IOT',
            },
            asset_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            waste_in_kgs: {
                type: DataTypes.FLOAT,
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
                    'GENERATED',
                    'CLASSIFIED',
                    'SCALED',
                    'STORED_FOR_TREATMENT',
                    'STORED_FOR_TRANSPORT',
                    'TREATED',
                    'RESIDUE_CLASSIFIED',
                    'RESIDUE_SCALED',
                    'RESIDUE_STORED_FOR_TRANSPORT',
                    'IN_TRANSIT',
                    'DISPOSED',
                ),
                allowNull: false,
                defaultValue: 'GENERATED',
            },
            waste_status_updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: Sequelize.Sequelize.fn('now'),
            },
            waste_status_updated_by: {
                type: DataTypes.STRING(32),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'waste_bag_collection',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'id' }],
                },
            ],
        },
    );
};
