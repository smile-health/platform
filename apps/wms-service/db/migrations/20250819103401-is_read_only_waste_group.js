'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // waste_treatment_group
        await queryInterface.addColumn('waste_treatment_group', 'group_id', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('waste_treatment_group', 'is_read_only', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
        await queryInterface.addIndex('waste_treatment_group', {
            fields: ['group_id'],
            name: 'waste_treatment_group_id',
        });

        // waste_transportation_group
        await queryInterface.addColumn('waste_transportation_group', 'group_id', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('waste_transportation_group', 'is_read_only', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
        await queryInterface.addIndex('waste_transportation_group', {
            fields: ['group_id'],
            name: 'waste_transportation_group_id',
        });

        // waste_treatment_external_group
        await queryInterface.addColumn('waste_treatment_external_group', 'group_id', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('waste_treatment_external_group', 'is_read_only', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
        await queryInterface.addIndex('waste_treatment_external_group', {
            fields: ['group_id'],
            name: 'waste_treatment_external_group_id',
        });

        // waste_transportation_external_group
        await queryInterface.addColumn('waste_transportation_external_group', 'group_id', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        // await queryInterface.addColumn('waste_transportation_external_group', 'is_read_only', {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: false,
        // });
        await queryInterface.addIndex('waste_transportation_external_group', {
            fields: ['group_id'],
            name: 'waste_transportation_external_group_id',
        });
    },

    async down(queryInterface, Sequelize) {
        // waste_transportation_external_group
        await queryInterface.removeIndex(
            'waste_transportation_external_group',
            'waste_transportation_external_group_id',
        );
        await queryInterface.removeColumn('waste_transportation_external_group', 'is_read_only');
        await queryInterface.removeColumn('waste_transportation_external_group', 'group_id');

        // waste_treatment_external_group
        await queryInterface.removeIndex(
            'waste_treatment_external_group',
            'waste_treatment_external_group_id',
        );
        await queryInterface.removeColumn('waste_treatment_external_group', 'is_read_only');
        await queryInterface.removeColumn('waste_treatment_external_group', 'group_id');

        // waste_transportation_group
        await queryInterface.removeIndex(
            'waste_transportation_group',
            'waste_transportation_group_id',
        );
        await queryInterface.removeColumn('waste_transportation_group', 'group_id');
        await queryInterface.removeColumn('waste_transportation_group', 'is_read_only');

        // waste_treatment_group
        await queryInterface.removeIndex('waste_treatment_group', 'waste_treatment_group_id');
        await queryInterface.removeColumn('waste_treatment_group', 'is_read_only');
        await queryInterface.removeColumn('waste_treatment_group', 'group_id');
    },
};
