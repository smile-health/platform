'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('entities', 'id_satu_sehat', {
            type: Sequelize.BIGINT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('entities', 'id_satu_sehat', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },
};
