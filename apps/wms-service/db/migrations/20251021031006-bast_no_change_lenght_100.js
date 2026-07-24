'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('disposal', 'bast_no', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });

        await queryInterface.changeColumn('disposal_items', 'bast_no', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });

        await queryInterface.changeColumn('waste_bag', 'bast_no', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('disposal', 'bast_no', {
            type: Sequelize.STRING(36),
            allowNull: true,
        });

        await queryInterface.changeColumn('disposal_items', 'bast_no', {
            type: Sequelize.STRING(36),
            allowNull: true,
        });

        await queryInterface.changeColumn('waste_bag', 'bast_no', {
            type: Sequelize.STRING(36),
            allowNull: true,
        });
    },
};
