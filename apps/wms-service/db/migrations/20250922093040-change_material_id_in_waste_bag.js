'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableName = 'waste_bag';
        const columnName = 'material_id';

        const columnExists = await queryInterface.sequelize.query(
            `
            SELECT COUNT(*) AS cnt
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = :tableName
            AND COLUMN_NAME = :columnName
            AND TABLE_SCHEMA = DATABASE()
            `,
            {
                type: Sequelize.QueryTypes.SELECT,
                replacements: { tableName, columnName },
            },
        );

        if (columnExists[0].cnt > 0) {
            await queryInterface.removeColumn(tableName, columnName);
        }

        await queryInterface.addColumn(tableName, 'material_ids', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('waste_bag', 'material_ids');
    },
};
