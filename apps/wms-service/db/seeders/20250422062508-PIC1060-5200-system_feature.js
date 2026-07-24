'use strict';
const db = require('../models');
var initModels = require('../models/init-models');
var models = initModels(db.sequelize);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('permission', [
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                name: 'healthcare_facility',
                description: 'Healthcare Facility',
            },
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                name: 'partner',
                description: 'Partner',
            },
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                name: 'partnership',
                description: 'Partnership',
            },
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                name: 'healthcare_facility_asset',
                description: 'Healthcare Facility Asset',
            },
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                name: 'waste_lifecycle',
                description: 'Waste Lifecycle',
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('permission', null, {});
    },
};
