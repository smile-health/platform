'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('manual_scale_request', 'entity_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });

        await queryInterface.changeColumn('user_fcm_token', 'entity_id', {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        });

        await queryInterface.addIndex('user_fcm_token', ['entity_id'], {
            name: 'user_fcm_token_entity_id',
            using: 'BTREE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('user_fcm_token', 'user_fcm_token_entity_id');

        await queryInterface.changeColumn('user_fcm_token', 'entity_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });

        await queryInterface.changeColumn('manual_scale_request', 'entity_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });
    },
};
