'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('partnership_operator_map', {
            partnership_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            operator_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
        });

        await queryInterface.addIndex('partnership_operator_map', ['partnership_id'], {
            name: 'partnership_id',
            using: 'BTREE',
        });

        await queryInterface.addIndex('partnership_operator_map', ['operator_id'], {
            name: 'operator_id',
            using: 'BTREE',
        });

        await queryInterface.createTable('partnership_vehicle_map', {
            partnership_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            vehicle_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('partnership_operator_map');
        await queryInterface.dropTable('partnership_vehicle_map');
    },
};
