'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('partnership', 'provider_operator_id');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('partnership', 'provider_operator_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            after: 'provider_type',
        });
    },
};
