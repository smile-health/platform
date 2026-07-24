'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.dropTable('partnership');

        await queryInterface.createTable(
            'partnership',
            {
                id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                },
                created_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                updated_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                created_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                updated_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                contract_id: {
                    type: Sequelize.STRING(32),
                    allowNull: true,
                },
                contract_start_date: {
                    type: Sequelize.DATEONLY,
                    allowNull: false,
                },
                contract_end_date: {
                    type: Sequelize.DATEONLY,
                    allowNull: false,
                },
                consumer_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                consumer_type: {
                    type: Sequelize.ENUM(
                        'LANDFILLER',
                        'TREATMENT_PROVIDER',
                        'RECYCLER',
                        'SPECIALIZED_TREATMENT_PROVIDER',
                        'TRANSPORTER',
                        'TRANSPORTER_RECYCLER',
                        'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                        'TRANSPORTER_LANDFILL',
                        'TRANSPORTER_TREATMENT_PROVIDER',
                        'TRANSPORTER_GOVERNMENT',
                    ),
                    allowNull: false,
                },
                waste_category_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                provider_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                provider_type: {
                    type: Sequelize.ENUM(
                        'LANDFILLER',
                        'TREATMENT_PROVIDER',
                        'RECYCLER',
                        'SPECIALIZED_TREATMENT_PROVIDER',
                        'TRANSPORTER',
                        'TRANSPORTER_RECYCLER',
                        'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                        'TRANSPORTER_LANDFILL',
                        'TRANSPORTER_TREATMENT_PROVIDER',
                        'TRANSPORTER_GOVERNMENT',
                    ),
                    allowNull: false,
                },
                provider_operator_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                partnership_status: {
                    type: Sequelize.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED'),
                    allowNull: false,
                    defaultValue: 'PENDING',
                },
                has_incinerator: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                has_autoclave: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
            },
            {
                charset: 'utf8',
                collate: 'utf8_general_ci',
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('partnership');

        await queryInterface.createTable(
            'partnership',
            {
                id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                },
                created_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                updated_at: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                },
                created_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                updated_by: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                },
                healthcare_facility_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                partner_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                contract_start_date: {
                    type: Sequelize.DATEONLY,
                    allowNull: false,
                },
                contract_end_date: {
                    type: Sequelize.DATEONLY,
                    allowNull: false,
                },
                contract_id: {
                    type: Sequelize.STRING(32),
                    allowNull: false,
                },
                partnership_status: {
                    type: Sequelize.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED'),
                    allowNull: false,
                    defaultValue: 'PENDING',
                },
                provider_type: {
                    type: Sequelize.ENUM(
                        'RECYCLER',
                        'TRANSPORTER',
                        'TRANSPORTER_SPECIALIZED',
                        'TRANSPORTER_LANDFILL',
                        'TRANSPORTER_TREATMENT',
                        'TRANSPORTER_GOVERNMENT',
                        'LANDFILLER',
                        'TREATMENT_PROVIDER',
                    ),
                    allowNull: false,
                },
                can_landfill: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                landfilling_provider: {
                    type: Sequelize.ENUM('SELF', 'THIRD_PARTY'),
                    allowNull: true,
                },
                can_recycle: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                recyling_provider: {
                    type: Sequelize.ENUM('SELF', 'THIRD_PARTY'),
                    allowNull: true,
                },
                has_incinerator: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                incinerator_provider: {
                    type: Sequelize.ENUM('SELF', 'THIRD_PARTY'),
                    allowNull: true,
                },
                has_autoclave: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                autoclave_provider: {
                    type: Sequelize.ENUM('SELF', 'THIRD_PARTY'),
                    allowNull: true,
                },
            },
            {
                charset: 'utf8',
                collate: 'utf8_general_ci',
            },
        );
    },
};
