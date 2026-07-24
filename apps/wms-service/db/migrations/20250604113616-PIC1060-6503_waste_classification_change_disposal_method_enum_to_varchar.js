'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_classification', 'disposal_method', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_classification', 'disposal_method', {
            type: Sequelize.ENUM(
                'TRANSPORT',
                'TREATMENT',
                'LANDFILL',
                'RECYCLE',
                'SPECIALIZED_TREATMENT',
                'GOVERNMENT_WASTE_TRANSPORT',
            ),
            allowNull: true,
        });
    },
};
