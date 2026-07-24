'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('healthcare_facility_asset', 'warranty_start_date', {
            type: Sequelize.DATEONLY,
            allowNull: true,
        });

        await queryInterface.renameColumn(
            'partnership',
            'waste_category_id',
            'waste_classification_id',
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('healthcare_facility_asset', 'warranty_start_date');
    },
};
