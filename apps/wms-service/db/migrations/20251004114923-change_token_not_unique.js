'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Pastikan kolom `token` tetap ada tanpa unique
        await queryInterface.changeColumn('user_fcm_token', 'token', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: false,
        });
    },

    async down(queryInterface, Sequelize) {
        // Tambahkan kembali constraint unique jika rollback
        await queryInterface.changeColumn('user_fcm_token', 'token', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        });
    },
};
