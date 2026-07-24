'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.renameTable('waste_bag_collection', 'waste_bag');
        await queryInterface.addColumn('waste_bag', 'waste_bag_qr_code_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            after: 'updated_by',
        });

        await queryInterface.addIndex('waste_bag', {
            fields: ['waste_bag_qr_code_id'],
            name: 'waste_bag_qr_code_id',
            type: 'UNIQUE',
        });

        await queryInterface.changeColumn('waste_bag', 'healthcare_facility_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_bag', 'waste_source_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_bag', 'waste_classification_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_bag', 'source_treatment_group_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        });
        await queryInterface.changeColumn('waste_bag', 'asset_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        });
        await queryInterface.renameColumn('waste_bag', 'waste_in_kgs', 'weight_in_kgs');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.renameTable('waste_bag', 'waste_bag_collection');
        await queryInterface.removeIndex('waste_bag_collection', 'waste_bag_qr_code_id');
        await queryInterface.removeColumn('waste_bag_collection', 'waste_bag_qr_code_id');

        await queryInterface.changeColumn('waste_bag_collection', 'healthcare_facility_id', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_bag_collection', 'waste_source_id', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_bag_collection', 'waste_classification_id', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_bag_collection', 'source_treatment_group_id', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: true,
        });
        await queryInterface.changeColumn('waste_bag_collection', 'asset_id', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
        });
        await queryInterface.renameColumn('waste_bag_collection', 'weight_in_kgs', 'waste_in_kgs');
    },
};
