const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_treatment_external_group',
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
            total_bags_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            total_weight_in_kgs: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            source_external_transportation_group_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            treatment_provider_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            treatment_operator_id: {
                type: DataTypes.STRING(36),
                allowNull: true,
                defaultValue: null,
            },
            transportation_status: {
                type: DataTypes.ENUM(
                    'READY_FOR_TREATMENT',
                    'INCINERATION_IN_PROCESS',
                    'STERILIZATION_IN_PROCESS',
                    'INCINERATED',
                    'STERILISED',
                    'LANDFILLED',
                    'RECYCLED',
                    'DISPOSED',
                    'COLLECTED',
                ),
                allowNull: false,
                defaultValue: 'READY_FOR_TREATMENT',
            },
        },
        {
            sequelize,
            tableName: 'waste_treatment_external_group',
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
                    name: 'waste_treatment_external_group_treatment_provider_id',
                    using: 'BTREE',
                    fields: [{ name: 'treatment_provider_id' }],
                },
                {
                    name: 'waste_treatment_external_group_created_at',
                    using: 'BTREE',
                    fields: [{ name: 'created_at' }],
                },
            ],
        },
    );
};
