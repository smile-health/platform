'use strict';
const db = require('../models');
var initModels = require('../models/init-models');
var models = initModels(db.sequelize);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Get all roles from the database
        const rolesRaw = await models.user_role.findAll();
        const roles = rolesRaw.map((role) => role.toJSON());

        // Get all system features from the database
        const systemFeaturesRaw = await models.permission.findAll();
        const systemFeatures = systemFeaturesRaw.map((feature) => feature.toJSON());

        // Insert system admin access
        console.log('== Seeding system_admin access ==');
        const systemAdminRole = roles.find((role) => role.name === 'system_admin');
        if (!systemAdminRole) {
            console.error('System admin role not found');
        } else {
            await queryInterface.bulkInsert(
                'user_role_permission_map',
                systemFeatures.map((feature) => ({
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    user_role_id: systemAdminRole.id,
                    permission_id: feature.id,
                })),
            );
        }

        // Insert HF admin access
        console.log('== Seeding hf_admin access ==');
        const hfAdminRole = roles.find((role) => role.name === 'hf_admin');
        if (!hfAdminRole) {
            console.error('HF Admin role not found');
        } else {
            await queryInterface.bulkInsert(
                'user_role_permission_map',
                systemFeatures.map((feature) => ({
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    user_role_id: hfAdminRole.id,
                    permission_id: feature.id,
                })),
            );
        }

        // Insert HF operator access
        console.log('== Seeding hf_operator access ==');
        const hfOperatorRole = roles.find((role) => role.name === 'hf_operator');
        if (!hfOperatorRole) {
            console.error('HF Operator role not found');
        } else {
            await queryInterface.bulkInsert(
                'user_role_permission_map',
                systemFeatures.map((feature) => ({
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    user_role_id: hfOperatorRole.id,
                    permission_id: feature.id,
                })),
            );
        }

        // Insert Partner admin access
        const partnerFeatures = ['partner', 'partnership'];

        console.log('== Seeding partner_admin access ==');
        const partnerAdminRole = roles.find((role) => role.name === 'partner_admin');
        if (!partnerAdminRole) {
            console.error('Partner Admin role not found');
        } else {
            await queryInterface.bulkInsert(
                'user_role_permission_map',
                systemFeatures.map((feature) => ({
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    user_role_id: partnerAdminRole.id,
                    permission_id: feature.id,
                })),
            );
        }

        // Insert Partner operator access
        console.log('== Seeding partner_operator access ==');
        const partnerOperatorRole = roles.find((role) => role.name === 'partner_operator');
        if (!partnerOperatorRole) {
            console.error('Partner Operator role not found');
        } else {
            await queryInterface.bulkInsert(
                'user_role_permission_map',
                systemFeatures.map((feature) => ({
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    user_role_id: partnerOperatorRole.id,
                    permission_id: feature.id,
                })),
            );
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_role_permission_map', null, {});
    },
};
