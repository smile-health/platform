const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'partnership_operator_map',
        {
            partnership_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            operator_id: {
                type: DataTypes.STRING(36),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'partnership_operator_map',
            timestamps: false,
            indexes: [
                {
                    name: 'partnership_id',
                    using: 'BTREE',
                    fields: [{ name: 'partnership_id' }],
                },
                {
                    name: 'operator_id',
                    using: 'BTREE',
                    fields: [{ name: 'operator_id' }],
                },
            ],
        },
    );
};
