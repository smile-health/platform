'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('partnership', 'pic_name', {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.addColumn('partnership', 'pic_position', {
            type: Sequelize.STRING(64),
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.addColumn('partnership', 'pic_phone_number', {
            type: Sequelize.STRING(32),
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.addColumn('partnership', 'price_per_kg', {
            type: Sequelize.FLOAT(10, 2),
            allowNull: true,
            defaultValue: null,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('partnership', 'pic_name');
        await queryInterface.removeColumn('partnership', 'pic_position');
        await queryInterface.removeColumn('partnership', 'pic_phone_number');
        await queryInterface.removeColumn('partnership', 'price_per_kg');
    },
};
