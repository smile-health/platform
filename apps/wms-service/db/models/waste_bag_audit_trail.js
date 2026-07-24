const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_bag_audit_trail',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            waste_bag_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            event: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            waste_bag_status: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            transport_status: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            healthcare_facility_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            transporter_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            third_party_provider_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
            updated_by: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            source: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            remarks: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'waste_bag_audit_trail',
            timestamps: true,
            createdAt: 'created_at',
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'id' }],
                },
                {
                    name: 'idx_waste_bag_id',
                    using: 'BTREE',
                    fields: [{ name: 'waste_bag_id' }],
                },
                {
                    name: 'idx_facility_created_at',
                    using: 'BTREE',
                    fields: [{ name: 'healthcare_facility_id' }, { name: 'created_at' }],
                },
            ],
        },
    );
};
