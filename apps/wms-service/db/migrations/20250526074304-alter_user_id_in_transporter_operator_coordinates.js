'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('transporter_operator_coodinates', 'user_id', {
            type: Sequelize.STRING(36),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('transporter_operator_coodinates', 'user_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });
    },
};
