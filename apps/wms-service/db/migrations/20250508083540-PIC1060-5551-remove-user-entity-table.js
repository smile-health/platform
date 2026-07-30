'use strict';
const sqlRunner = require('../helpers/sqlRunner');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await sqlRunner.rawSQLRunner({
            sqlPath: './db/migrations-sql/PIC1060-5551-remove-user-entity-table/up.sql',
            queryInterface,
        });
    },

    async down(queryInterface, Sequelize) {
        await sqlRunner.rawSQLRunner({
            sqlPath: './db/migrations-sql/PIC1060-5551-remove-user-entity-table/down.sql',
            queryInterface,
        });
    },
};
