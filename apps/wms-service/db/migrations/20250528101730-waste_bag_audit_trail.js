'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('waste_bag_audit_trail', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            waste_bag_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            event: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            waste_bag_status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            transport_status: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            healthcare_facility_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            transporter_id: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },
            third_party_provider_id: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },
            updated_by: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            source: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            remarks: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });

        await queryInterface.addIndex('waste_bag_audit_trail', ['waste_bag_id'], {
            name: 'idx_waste_bag_id',
        });

        await queryInterface.addIndex(
            'waste_bag_audit_trail',
            ['healthcare_facility_id', 'created_at'],
            {
                name: 'idx_facility_created_at',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('waste_bag_audit_trail');
    },
};
