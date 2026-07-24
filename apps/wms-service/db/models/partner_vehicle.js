const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'partner_vehicle',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
            },
            created_by: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            updated_by: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
            entity_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            vehicle_type: {
                type: DataTypes.ENUM(
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
            },
            vehicle_number: {
                type: DataTypes.STRING(16),
                allowNull: false,
                unique: 'Unique Vehicle Number',
            },
            capacity_in_kgs: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            transporter_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'partner_vehicle',
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
                {
                    name: 'vehicle_number',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'vehicle_number' }],
                },
            ],
        },
    );
};
