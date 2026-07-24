'use strict';
const sqlRunner = require('../helpers/sqlRunner');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await sqlRunner.rawSQLRunner({
            sqlPath: './migrations-sql/PIC1060-5200-entity_table/up.sql',
            queryInterface,
        });
    },

    async down(queryInterface, Sequelize) {
        await sqlRunner.rawSQLRunner({
            sqlPath: './migrations-sql/PIC1060-5200-entity_table/down.sql',
            queryInterface,
        });
    },
};
