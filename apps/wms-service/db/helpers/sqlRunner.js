var fs = require('fs');

const rawSQLRunner = ({
    sqlPath,
    queryInterface,
    // logSQLContent
}) => {
    return new Promise((resolve, reject) => {
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

        // if (logSQLContent) {
        //   console.log(`\n== Begin SQL Content for file: ${sqlPath} ==\n`)
        //   console.log(sqlContent);
        //   console.log(`\n== End SQL Content ==\n`)
        // }

        queryInterface.sequelize
            .query(sqlContent)
            .then(() => {
                resolve(null);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

module.exports = {
    rawSQLRunner,
};
