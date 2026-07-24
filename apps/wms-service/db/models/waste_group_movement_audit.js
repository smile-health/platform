const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'waste_group_movement_audit',
        {
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
            },
            waste_bag_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            group_type: {
                type: DataTypes.ENUM(
                    'INTERNAL_TREATMENT',
                    'EXTERNAL_TREATMENT',
                    'INTERNAL_TRANSPORTATION',
                    'EXTERNAL_TRANSPORTATION',
                ),
                allowNull: false,
            },
            group_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            added_on: {
                type: DataTypes.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            removed_on: {
                type: DataTypes.DATE(3),
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            sequelize,
            tableName: 'waste_group_movement_audit',
            timestamps: false,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'id' }],
                },
                {
                    name: 'waste_group_movement_audit_waste_bag_id',
                    using: 'BTREE',
                    fields: [{ name: 'waste_bag_id' }],
                },
                {
                    name: 'waste_group_movement_audit_group_id',
                    using: 'BTREE',
                    fields: [{ name: 'group_id' }],
                },
            ],
        },
    );
};
