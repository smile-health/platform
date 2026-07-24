const fs = require('fs');
require('dotenv').config();

// Reuses the same DB_* vars as src/config/db.config.ts (the app's runtime connection)
// so one .env drives both `pnpm dev` and `npm run db:migrate`.
module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
            bigNumberStrings: true,
            multipleStatements: true,
        },
        seederStorage: 'sequelize',
    },
    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
            bigNumberStrings: true,
            multipleStatements: true,
        },
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
            bigNumberStrings: true,
            multipleStatements: true,
            // ssl: {
            //   ca: fs.readFileSync(__dirname + '/mysql-ca-main.crt'),
            // },
        },
    },
};
