'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add a standard non unique index on the parent_id column of the regions table
        queryInterface.addIndex('region', ['parent_id'], {
            name: 'parent_id',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('region', 'parent_id');
    },
};
