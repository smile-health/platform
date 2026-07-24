'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const sql = `ALTER TABLE waste_bag MODIFY waste_bag_qr_code_id VARCHAR(255) CHARACTER SET utf8mb4;`;
        return queryInterface.sequelize.query(sql);
    },

    async down(queryInterface, Sequelize) {
        const sql = `ALTER TABLE waste_bag MODIFY waste_bag_qr_code_id VARCHAR(255) CHARACTER SET utf8mb4;`;
        return queryInterface.sequelize.query(sql);
    },
};
