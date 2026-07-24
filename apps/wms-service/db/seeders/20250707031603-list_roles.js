'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const timestamp = new Date();

        const listUserRoles = [
            'Super Admin',
            'Admin Healthcare Facility',
            'Operator Healthcare Facility',
            'Admin Transporter',
            'Operator Transporter',
            'Admin Landfill',
            'Operator Landfill',
            'Admin Treatment',
            'Operator Treatment',
            'Admin Recycler',
            'Operator Recycler',
            'Admin Specialized Transport',
            'Operator Specialized Transport',
            'Dinkes Manager',
            'Dinkes Admin',
            'Dinkes Operator',
        ];

        await queryInterface.sequelize.query('TRUNCATE TABLE user_role;');

        await queryInterface.bulkInsert(
            'user_role',
            listUserRoles.map((role) => ({
                name: role,
                region_id: 1,
                created_by: 'system_init',
                updated_by: 'system_init',
                created_at: timestamp,
                updated_at: timestamp,
            })),
            {},
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_role', {
            name: {
                [Sequelize.Op.in]: [
                    'Super Admin',
                    'Admin Healthcare Facility',
                    'Operator Healthcare Facility',
                    'Admin Transporter',
                    'Operator Transporter',
                    'Admin Landfill',
                    'Operator Landfill',
                    'Admin Treatment',
                    'Operator Treatment',
                    'Admin Recycler',
                    'Operator Recycler',
                    'Admin Specialized Transport',
                    'Operator Specialized Transport',
                    'Dinkes Manager',
                    'Dinkes Admin',
                    'Dinkes Operator',
                ],
            },
        });
    },
};
