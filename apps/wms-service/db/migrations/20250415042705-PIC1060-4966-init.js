'use strict';
const sqlRunner = require('../helpers/sqlRunner');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await sqlRunner.rawSQLRunner({
            sqlPath: './migrations-sql/PIC1060-4966-init/up.sql',
            queryInterface,
        });
    },

    async down(queryInterface, Sequelize) {
        await sqlRunner.rawSQLRunner({
            sqlPath: './migrations-sql/PIC1060-4966-init/down.sql',
            queryInterface,
        });
    },
};
