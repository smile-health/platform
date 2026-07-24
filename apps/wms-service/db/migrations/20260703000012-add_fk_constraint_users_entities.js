'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.addConstraint('users', {
            fields: ['entity_id'],
            type: 'foreign key',
            name: 'fk_users_entity',
            references: { table: 'entities', field: 'id' },
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint('users', 'fk_users_entity');
    },
};
