'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('entity_location', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            created_at: {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            updated_at: {
                type: Sequelize.DATE(3),
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            created_by: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            updated_by: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            entity_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            location_name: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            latitude: {
                type: Sequelize.FLOAT(10, 6),
                allowNull: false,
            },
            longitude: {
                type: Sequelize.FLOAT(10, 6),
                allowNull: false,
            },
            distance_limit_in_meters: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
            },
            address: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            province_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
            city_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
            },
        });

        await queryInterface.addIndex('entity_location', ['entity_id'], {
            name: 'entity_id_index',
            using: 'BTREE',
        });

        await queryInterface.addIndex('entity_location', ['location_name'], {
            name: 'location_name_index',
            using: 'BTREE',
        });
        await queryInterface.addIndex('entity_location', ['province_id'], {
            name: 'province_id_index',
            using: 'BTREE',
        });
        await queryInterface.addIndex('entity_location', ['city_id'], {
            name: 'city_id_index',
            using: 'BTREE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('entity_location');
    },
};
