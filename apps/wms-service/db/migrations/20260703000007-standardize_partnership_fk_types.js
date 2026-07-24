'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('partnership', 'transporter_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        });

        await queryInterface.addIndex('partnership', ['transporter_id'], {
            name: 'partnership_transporter_id',
            using: 'BTREE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('partnership', 'partnership_transporter_id');

        await queryInterface.changeColumn('partnership', 'transporter_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
    },
};
