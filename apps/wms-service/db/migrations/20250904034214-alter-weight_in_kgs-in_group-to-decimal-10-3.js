'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'total_weight_in_kgs',
            {
                type: Sequelize.DECIMAL(10, 3),
                allowNull: true,
            },
        );
        await queryInterface.changeColumn('waste_transportation_group', 'total_weight_in_kgs', {
            type: Sequelize.DECIMAL(10, 3),
            allowNull: true,
        });
        await queryInterface.changeColumn('waste_treatment_external_group', 'total_weight_in_kgs', {
            type: Sequelize.DECIMAL(10, 3),
            allowNull: true,
        });
        await queryInterface.changeColumn('waste_treatment_group', 'total_weight_in_kgs', {
            type: Sequelize.DECIMAL(10, 3),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn(
            'waste_transportation_external_group',
            'total_weight_in_kgs',
            {
                type: Sequelize.INTEGER(11),
                allowNull: false,
            },
        );
        await queryInterface.changeColumn('waste_transportation_group', 'total_weight_in_kgs', {
            type: Sequelize.INTEGER(11),
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_treatment_external_group', 'total_weight_in_kgs', {
            type: Sequelize.INTEGER(11),
            allowNull: false,
        });
        await queryInterface.changeColumn('waste_treatment_group', 'total_weight_in_kgs', {
            type: Sequelize.INTEGER(11),
            allowNull: false,
        });
    },
};
