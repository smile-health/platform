'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('partnership', 'provider_type', {
            type: Sequelize.ENUM(
                'LANDFILLER',
                'TREATMENT_PROVIDER',
                'RECYCLER',
                'TREATMENT',
                'SPECIALIZED_TREATMENT_PROVIDER',
                'TRANSPORTER',
                'TRANSPORTER_RECYCLER',
                'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                'TRANSPORTER_LANDFILL',
                'TRANSPORTER_TREATMENT_PROVIDER',
                'TRANSPORTER_TREATMENT',
                'TRANSPORTER_GOVERNMENT',
                'TRANSPORTER_GOVERNMENT_WASTE_BANK',
            ),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('partnership', 'provider_type', {
            type: Sequelize.ENUM(
                'LANDFILLER',
                'TREATMENT_PROVIDER',
                'RECYCLER',
                'TREATMENT',
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
    },
};
