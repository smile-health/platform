'use strict';
const db = require('../models');
var initModels = require('../models/init-models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const names = [
            'Telkomsel',
            'Barloworld',
            'VersaCold',
            'Cloverleaf',
            'Henningsen',
            'Doing',
            'Henan',
            'Naugra',
            'Samart',
        ];

        // Generate seed data
        const seedData = names.map((name) => ({
            created_by: 'system_init',
            updated_by: 'system_init',
            name: name,
            description: `${name} Manufacturer`,
        }));

        await queryInterface.bulkInsert('asset_manufacturer', seedData);
    },

    async down(queryInterface, Sequelize) {
        const names = [
            'Telkomsel',
            'Barloworld',
            'VersaCold',
            'Cloverleaf',
            'Henningsen',
            'Doing',
            'Henan',
            'Naugra',
            'Samart',
        ];

        await queryInterface.bulkDelete('asset_manufacturer', {
            name: names,
        });
    },
};
