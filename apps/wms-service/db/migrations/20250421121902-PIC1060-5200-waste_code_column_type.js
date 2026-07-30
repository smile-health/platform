'use strict';
const sqlRunner = require('../helpers/sqlRunner');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await sqlRunner.rawSQLRunner({
            sqlPath: './db/migrations-sql/PIC1060-5200-waste_code_column_type/up.sql',
            queryInterface,
        });
    },

    async down(queryInterface, Sequelize) {
        await sqlRunner.rawSQLRunner({
            sqlPath: './db/migrations-sql/PIC1060-5200-waste_code_column_type/down.sql',
            queryInterface,
        });
    },
};
