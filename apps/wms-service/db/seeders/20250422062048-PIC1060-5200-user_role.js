'use strict';
const db = require('../models');
var initModels = require('../models/init-models');
var models = initModels(db.sequelize);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const indonesia = await models.region.findOne({
            where: {
                code: 'INDO',
            },
        });
        if (!indonesia) {
            throw new Error('Region with code "INDO" not found');
        }
        const indonesiaRegionId = indonesia.dataValues.id;

        await queryInterface.bulkInsert('user_role', [
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'system_admin',
                description: 'System Admin',
            },
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'hf_admin',
                description: 'Healthcare Facility Admin',
            },
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'hf_operator',
                description: 'Healthcare Facility Operator',
            },
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'partner_admin',
                description: 'Partner Admin',
            },
            {
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'partner_operator',
                description: 'Partner Operator',
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_role', null, {});
    },
};
