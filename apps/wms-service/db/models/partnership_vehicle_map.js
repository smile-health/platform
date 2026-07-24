const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'partnership_vehicle_map',
        {
            partnership_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            vehicle_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'partnership_vehicle_map',
            timestamps: false,
            indexes: [
                {
                    name: 'partnership_id',
                    using: 'BTREE',
                    fields: [{ name: 'partnership_id' }],
                },
                {
                    name: 'vehicle_id',
                    using: 'BTREE',
                    fields: [{ name: 'vehicle_id' }],
                },
            ],
        },
    );
};
