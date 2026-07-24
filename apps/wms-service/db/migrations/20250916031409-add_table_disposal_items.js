'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('disposal_items', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            material_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
            },
            bast_no: {
                type: Sequelize.STRING(36),
                allowNull: false,
            },
            material_name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            qty: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
        });

        await queryInterface.addIndex('disposal_items', {
            fields: ['material_id'],
            name: 'idx_disposal_items_material_id',
        });

        await queryInterface.addIndex('disposal_items', {
            fields: ['bast_no'],
            name: 'idx_disposal_items_bast_no',
        });

        await queryInterface.addIndex('disposal_items', {
            fields: ['material_name'],
            name: 'idx_disposal_items_material_name',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('disposal_items', 'idx_disposal_items_material_name');
        await queryInterface.removeIndex('disposal_items', 'idx_disposal_items_bast_no');
        await queryInterface.removeIndex('disposal_items', 'idx_disposal_items_material_id');
        await queryInterface.dropTable('disposal_items');
    },
};
