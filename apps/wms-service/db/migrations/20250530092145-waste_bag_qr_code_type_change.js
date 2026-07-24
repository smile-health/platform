'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag', 'waste_bag_qr_code_id', {
            type: Sequelize.STRING(255),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag', 'waste_bag_qr_code_id', {
            type: Sequelize.BIGINT,
            allowNull: false,
        });
    },
};
