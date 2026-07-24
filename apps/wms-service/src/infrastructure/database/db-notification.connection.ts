import { Dialect, Sequelize } from 'sequelize';
import dbConfig from '../../config/db-notification.config';

export const sequelize = new Sequelize(dbConfig.database!, dbConfig.username!, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect as Dialect,
    pool: {
        max: process.env.NODE_ENV === 'development' ? 10 : 30, // default cukup 30 per instance
        min: 2,             // simpan koneksi idle minimal agar cepat respon
        acquire: 60000,     // tunggu koneksi sampai 60 detik sebelum timeout
        idle: 15000,        // koneksi idle dilepas setelah 15 detik
        evict: 5000,        // periksa koneksi idle setiap 5 detik
    },

    logging: process.env.NODE_ENV === 'development' ? console.log : false,

    retry: {
        max: 3,
    },
});

export async function authenticateDatabase() {
    try {
        await sequelize.authenticate();
        console.log('[Database-Notification] Connected successfully');
    } catch (error) {
        console.error('[Database-Notification] Connection failed:', error);
        throw new Error('Failed to connect to database notification');
    }
}

// to validate schema
// (async () => {
//     try {
//         await sequelize.sync({ alter: true });
//         console.log('Database schema synchronized successfully!');
//     } catch (error) {
//         console.error('Failed to synchronize database schema:', error);
//     }
// })();
