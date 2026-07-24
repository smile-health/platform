'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('waste_bag_audit_trail', 'is_group', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
        await queryInterface.addColumn('waste_bag_audit_trail', 'is_failed', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_bag_audit_trail', 'is_group');
        await queryInterface.removeColumn('waste_bag_audit_trail', 'is_failed');
    },
};
