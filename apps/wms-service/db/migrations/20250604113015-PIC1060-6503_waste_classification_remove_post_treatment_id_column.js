'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn(
            'waste_classification',
            'post_treatment_waste_characteristics_id',
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'waste_classification',
            'post_treatment_waste_characteristics_id',
            {
                type: Sequelize.INTEGER,
                allowNull: true,
                after: 'treatment_method',
            },
        );
    },
};
