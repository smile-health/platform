'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('entities', 'id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });

        await queryInterface.changeColumn('users', 'id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });

        await queryInterface.changeColumn('users', 'entity_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('users', 'entity_id', {
            type: Sequelize.BIGINT,
            allowNull: false,
        });

        await queryInterface.changeColumn('users', 'id', {
            type: Sequelize.BIGINT,
            allowNull: false,
        });

        await queryInterface.changeColumn('entities', 'id', {
            type: Sequelize.BIGINT,
            allowNull: false,
        });
    },
};
