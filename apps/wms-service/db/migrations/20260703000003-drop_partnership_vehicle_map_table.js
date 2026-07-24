'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.dropTable('partnership_vehicle_map');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.createTable('partnership_vehicle_map', {
            partnership_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            vehicle_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            deleted_by: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },
        });

        await queryInterface.addIndex('partnership_vehicle_map', ['partnership_id'], {
            name: 'partnership_id',
            using: 'BTREE',
        });

        await queryInterface.addIndex('partnership_vehicle_map', ['vehicle_id'], {
            name: 'vehicle_id',
            using: 'BTREE',
        });
    },
};
