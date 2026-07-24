const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_source',
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
            healthcare_facility_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            source_type: {
                type: DataTypes.ENUM('INTERNAL', 'EXTERNAL', 'INTERNAL_TREATMENT'),
                allowNull: false,
                defaultValue: 'INTERNAL',
            },
            internal_source_name: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            internal_treatment_name: {
                type: DataTypes.ENUM('PYROLYSIS', 'DISINFECTION'),
                allowNull: true,
            },
            external_healthcare_facility_name: {
                type: DataTypes.STRING(64),
                allowNull: true,
            },
            external_healthcare_facility_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            tableName: 'waste_source',
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
