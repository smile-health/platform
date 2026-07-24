'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('partnership', 'provider_type', {
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
                'TRANSPORTER_TREATMENT',
                'TRANSPORTER_GOVERNMENT',
            ),
            allowNull: false,
        });

        await queryInterface.changeColumn('partnership', 'consumer_type', {
            type: Sequelize.ENUM(
                'HEALTHCARE_FACILITY',
                'TRANSPORTER',
                'TRANSPORTER_RECYCLER',
                'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                'TRANSPORTER_LANDFILL',
                'TRANSPORTER_TREATMENT',
                'TRANSPORTER_TREATMENT_PROVIDER',
            ),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('partnership', 'consumer_type', {
            type: Sequelize.ENUM(
                'HEALTHCARE_FACILITY',
                'TRANSPORTER',
                'TRANSPORTER_RECYCLER',
                'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                'TRANSPORTER_LANDFILL',
                'TRANSPORTER_TREATMENT_PROVIDER',
            ),
            allowNull: false,
        });
        await queryInterface.changeColumn('partnership', 'provider_type', {
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
        });
    },
};
