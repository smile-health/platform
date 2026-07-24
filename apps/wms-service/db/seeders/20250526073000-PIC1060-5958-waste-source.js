'use strict';
const db = require('../models');
var initModels = require('../models/init-models');
var models = initModels(db.sequelize);

const HEALTHCARE_FACILITY_ID = '820678';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            'waste_source',
            [
                {
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    healthcare_facility_id: HEALTHCARE_FACILITY_ID,
                    source_type: 'INTERNAL',
                    internal_source_name: 'Sugery Room 1',
                    is_active: true,
                },
                {
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    healthcare_facility_id: HEALTHCARE_FACILITY_ID,
                    source_type: 'INTERNAL',
                    internal_source_name: 'General Ward',
                    is_active: true,
                },
                {
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    healthcare_facility_id: HEALTHCARE_FACILITY_ID,
                    source_type: 'INTERNAL_TREATMENT',
                    internal_treatment_name: 'PYROLYSIS',
                    is_active: true,
                },
                {
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    healthcare_facility_id: HEALTHCARE_FACILITY_ID,
                    source_type: 'INTERNAL_TREATMENT',
                    internal_treatment_name: 'DISINFECTION',
                    is_active: true,
                },
                {
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    healthcare_facility_id: HEALTHCARE_FACILITY_ID,
                    source_type: 'EXTERNAL',
                    external_healthcare_facility_id: '1',
                    is_active: true,
                },
                {
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    healthcare_facility_id: HEALTHCARE_FACILITY_ID,
                    source_type: 'EXTERNAL',
                    external_healthcare_facility_id: '2',
                    is_active: true,
                },
            ],
            {},
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('waste_source', null, {});
    },
};
