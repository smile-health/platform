const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'partnership',
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
                allowNull: false,
            },
            contract_id: {
                type: DataTypes.STRING(32),
                allowNull: true,
            },
            contract_start_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            contract_end_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            consumer_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            consumer_type: {
                type: DataTypes.ENUM(
                    'HEALTHCARE_FACILITY',
                    'TRANSPORTER',
                    'TRANSPORTER_RECYCLER',
                    'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                    'TRANSPORTER_LANDFILL',
                    'TRANSPORTER_TREATMENT_PROVIDER',
                ),
                allowNull: false,
            },
            waste_classification_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            provider_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            provider_type: {
                type: DataTypes.ENUM(
                    'LANDFILLER',
                    'TREATMENT_PROVIDER',
                    'RECYCLER',
                    'SPECIALIZED_TREATMENT_PROVIDER',
                    'TRANSPORTER',
                    'TRANSPORTER_RECYCLER',
                    'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                    'TRANSPORTER_LANDFILL',
                    'TRANSPORTER_TREATMENT_PROVIDER',
                    'TRANSPORTER_GOVERNMENT',
                ),
                allowNull: false,
            },
            provider_operator_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
            },
            partnership_status: {
                type: DataTypes.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            has_incinerator: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
            has_autoclave: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 0,
            },
            pic_name: {
                type: DataTypes.STRING(255),
                allowNull: true,
                defaultValue: null,
            },
            pic_position: {
                type: DataTypes.STRING(64),
                allowNull: true,
                defaultValue: null,
            },
            pic_phone_number: {
                type: DataTypes.STRING(32),
                allowNull: true,
                defaultValue: null,
            },
            price_per_kg: {
                type: DataTypes.FLOAT(10, 2),
                allowNull: true,
                defaultValue: null,
            },
            transporter_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'partnership',
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
