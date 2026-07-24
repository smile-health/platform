'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const t = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn(
                'waste_bag',
                'bast_no',
                {
                    type: Sequelize.STRING(36),
                    allowNull: true,
                    comment: 'Snapshot bast number dari smile',
                },
                { transaction: t },
            );

            await queryInterface.addColumn(
                'waste_bag',
                'material_id',
                {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: true,
                    comment: 'FK material ID',
                },
                { transaction: t },
            );

            await queryInterface.addIndex('waste_bag', ['bast_no'], {
                name: 'idx_waste_bag_bast_no',
                transaction: t,
            });
            await queryInterface.addIndex('waste_bag', ['material_id'], {
                name: 'idx_waste_bag_material_id',
                transaction: t,
            });

            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },

    async down(queryInterface, Sequelize) {
        const t = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeIndex('waste_bag', 'idx_waste_bag_material_id', {
                transaction: t,
            });
            await queryInterface.removeIndex('waste_bag', 'idx_waste_bag_bast_no', {
                transaction: t,
            });

            await queryInterface.removeColumn('waste_bag', 'bast_no', { transaction: t });
            await queryInterface.removeColumn('waste_bag', 'material_id', { transaction: t });

            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
};
