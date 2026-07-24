'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const timestamp = new Date();

        const listUserRoles = [
            'Sanitarian Healthcare Facility',
            'Kemenkes Manager',
            'Kemenkes Admin',
            'Kemenkes Operator',
        ];

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

        // Add the type column
        await queryInterface.addColumn('user_role', 'type', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });

        // Get all existing user roles and update them directly
        const allUserRoles = await queryInterface.sequelize.query(
            'SELECT id, name FROM user_role;',
            { type: Sequelize.QueryTypes.SELECT },
        );

        for (const role of allUserRoles) {
            const snakeCaseType = role.name
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '')
                .replace(/_+/g, '_');

            await queryInterface.sequelize.query(
                `UPDATE user_role SET type = :type, updated_at = :updatedAt WHERE id = :id`,
                {
                    replacements: {
                        type: snakeCaseType,
                        updatedAt: timestamp,
                        id: role.id,
                    },
                },
            );
        }

        // Make the type column not null after populating all values
        await queryInterface.changeColumn('user_role', 'type', {
            type: Sequelize.STRING(64),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('user_role', 'type');
    },
};
