export default {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: 'mysql',
};
// export default {
//     host: '10.10.0.8',
//     port: 3306,
//     username: 'wms',
//     password: '*****',
//     database: 'dev_smile_wms',
//     dialect: 'mysql',
// };
// export default {
//     host: 'wms-smile5-uat.cxeycqoo6axz.ap-southeast-3.rds.amazonaws.com',
//     port: 3306,
//     username: 'usr_uat_wms',
//     password: '*****',
//     database: 'uat_smile_wms',
//     dialect: 'mysql',
// };
