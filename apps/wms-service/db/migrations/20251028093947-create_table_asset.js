'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('healthcare_asset', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                allowNull: false,
            },
            asset_id: {
                type: Sequelize.STRING(64),
                allowNull: true,
            },
            asset_type_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            status: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            asset_working_status_name: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            entity_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('healthcare_asset');
    },
};
