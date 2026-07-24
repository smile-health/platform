'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableName = 'user_fcm_token';
        const constraintName = 'token';

        const constraints = await queryInterface.getForeignKeyReferencesForTable(tableName);
        const indexes = await queryInterface.showIndex(tableName);

        const constraintExists =
            constraints.some((c) => c.constraintName === constraintName) ||
            indexes.some((i) => i.name === constraintName);

        if (constraintExists) {
            await queryInterface.removeConstraint(tableName, constraintName);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addConstraint('user_fcm_token', {
            fields: ['token'],
            type: 'unique',
            name: 'token',
        });
    },
};
