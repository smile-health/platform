'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            'ALTER TABLE `partnership` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci',
        );
        await queryInterface.sequelize.query(
            'ALTER TABLE `waste_source` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci',
        );
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(
            'ALTER TABLE `partnership` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci',
        );
        await queryInterface.sequelize.query(
            'ALTER TABLE `waste_source` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci',
        );
    },
};
