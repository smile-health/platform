'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_hierarchy', 'level', {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        });

        await queryInterface.changeColumn('waste_classification', 'disposal_method', {
            type: Sequelize.ENUM(
                'TRANSPORT',
                'TREATMENT',
                'LANDFILL',
                'RECYCLE',
                'SPECIALIZED_TREATMENT',
                'GOVERNMENT_WASTE_TRANSPORT',
            ),
            allowNull: false,
        });

        await queryInterface.changeColumn('waste_classification', 'waste_bag_color_code', {
            type: Sequelize.ENUM('BLACK', 'GRAY', 'YELLOW', 'PURPLE', 'BROWN', 'RED', 'NONE'),
            allowNull: false,
        });

        await queryInterface.changeColumn('waste_classification', 'waste_code', {
            type: Sequelize.STRING(64),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_hierarchy', 'level');

        await queryInterface.changeColumn('waste_classification', 'disposal_method', {
            type: Sequelize.ENUM('LANDFILL', 'RECYCLE', 'TRANSPORTATION'),
            allowNull: false,
        });

        await queryInterface.changeColumn('waste_classification', 'waste_bag_color_code', {
            type: Sequelize.ENUM('BLACK', 'GRAY', 'YELLOW', 'PURPLE', 'BROWN', 'RED'),
            allowNull: false,
        });

        await queryInterface.changeColumn('waste_classification', 'waste_code', {
            type: Sequelize.STRING(32),
            allowNull: false,
        });
    },
};
