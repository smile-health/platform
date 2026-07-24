'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            'region',
            [
                {
                    created_by: 'system_init',
                    updated_by: 'system_init',
                    region_type: 'COUNTRY',
                    code: 'INDO',
                    name: 'Indonesia',
                },
            ],
            {},
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('region', null, {});
    },
};
