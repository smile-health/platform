'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag', 'source_treatment_group_id', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag', 'source_treatment_group_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        });
    },
};
