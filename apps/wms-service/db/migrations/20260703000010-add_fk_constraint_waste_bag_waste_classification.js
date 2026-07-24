'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.addConstraint('waste_bag', {
            fields: ['waste_classification_id'],
            type: 'foreign key',
            name: 'fk_waste_bag_waste_classification',
            references: { table: 'waste_classification', field: 'id' },
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint('waste_bag', 'fk_waste_bag_waste_classification');
    },
};
