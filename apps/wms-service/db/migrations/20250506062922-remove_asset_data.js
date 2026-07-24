'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.dropTable('asset_data');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.createTable('asset_data', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            timestamp: {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            asset_id: {
                type: Sequelize.STRING(32),
                allowNull: false,
            },
            value: {
                type: Sequelize.STRING(32),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM(
                    'OPERATIONAL',
                    'UNDER_MAINTENANCE',
                    'OUT_OF_SERVICE',
                    'IDLE',
                    'RETIRED',
                ),
                allowNull: false,
                defaultValue: 'IDLE',
            },
        });
    },
};
