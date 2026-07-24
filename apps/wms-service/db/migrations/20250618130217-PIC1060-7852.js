'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('partnership_operator_map', 'operator_id', {
            type: Sequelize.STRING(36),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('partnership_operator_map', 'operator_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });
    },
};
