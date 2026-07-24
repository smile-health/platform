'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag_audit_trail', 'waste_bag_id', {
            type: Sequelize.STRING(255),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('waste_bag_audit_trail', 'waste_bag_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });
    },
};
