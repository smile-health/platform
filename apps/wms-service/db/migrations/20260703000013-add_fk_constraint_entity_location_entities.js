'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.addConstraint('entity_location', {
            fields: ['entity_id'],
            type: 'foreign key',
            name: 'fk_entity_location_entity',
            references: { table: 'entities', field: 'id' },
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint('entity_location', 'fk_entity_location_entity');
    },
};
