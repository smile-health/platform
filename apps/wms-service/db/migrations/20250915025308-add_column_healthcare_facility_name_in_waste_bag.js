'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const t = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn(
                'waste_bag',
                'healthcare_facility_name',
                {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                    comment: 'Snapshot nama fasilitas kesehatan saat pencatatan',
                },
                { transaction: t },
            );

            await queryInterface.addColumn(
                'waste_bag',
                'transporter_name',
                {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                    comment: 'Snapshot nama transporter (jika ada)',
                },
                { transaction: t },
            );

            await queryInterface.addColumn(
                'waste_bag',
                'third_party_name',
                {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                    comment: 'Snapshot nama pihak ketiga (jika ada)',
                },
                { transaction: t },
            );

            await queryInterface.addColumn(
                'waste_bag',
                'province_id',
                {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: true,
                    comment: 'FK ke master province',
                },
                { transaction: t },
            );

            await queryInterface.addColumn(
                'waste_bag',
                'province_name',
                {
                    type: Sequelize.STRING(200),
                    allowNull: true,
                    comment: 'Snapshot nama provinsi',
                },
                { transaction: t },
            );

            await queryInterface.addColumn(
                'waste_bag',
                'regency_id',
                {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: true,
                    comment: 'FK ke master regency/city',
                },
                { transaction: t },
            );
            await queryInterface.addColumn(
                'waste_bag',
                'regency_name',
                {
                    type: Sequelize.STRING(200),
                    allowNull: true,
                    comment: 'Snapshot nama kabupaten/kota',
                },
                { transaction: t },
            );

            await queryInterface.addColumn(
                'waste_bag',
                'district_id',
                {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: true,
                    comment: 'FK ke master district (kecamatan)',
                },
                { transaction: t },
            );
            await queryInterface.addColumn(
                'waste_bag',
                'district_name',
                {
                    type: Sequelize.STRING(200),
                    allowNull: true,
                    comment: 'Snapshot nama kecamatan',
                },
                { transaction: t },
            );

            await queryInterface.addIndex('waste_bag', ['province_id'], {
                name: 'idx_waste_bag_province_id',
                transaction: t,
            });
            await queryInterface.addIndex('waste_bag', ['regency_id'], {
                name: 'idx_waste_bag_regency_id',
                transaction: t,
            });
            await queryInterface.addIndex('waste_bag', ['district_id'], {
                name: 'idx_waste_bag_district_id',
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
            await queryInterface.removeIndex('waste_bag', 'idx_waste_bag_district_id', {
                transaction: t,
            });
            await queryInterface.removeIndex('waste_bag', 'idx_waste_bag_regency_id', {
                transaction: t,
            });
            await queryInterface.removeIndex('waste_bag', 'idx_waste_bag_province_id', {
                transaction: t,
            });

            await queryInterface.removeColumn('waste_bag', 'district_name', { transaction: t });
            await queryInterface.removeColumn('waste_bag', 'district_id', { transaction: t });
            await queryInterface.removeColumn('waste_bag', 'regency_name', { transaction: t });
            await queryInterface.removeColumn('waste_bag', 'regency_id', { transaction: t });
            await queryInterface.removeColumn('waste_bag', 'province_name', { transaction: t });
            await queryInterface.removeColumn('waste_bag', 'province_id', { transaction: t });

            await queryInterface.removeColumn('waste_bag', 'third_party_name', { transaction: t });
            await queryInterface.removeColumn('waste_bag', 'transporter_name', { transaction: t });
            await queryInterface.removeColumn('waste_bag', 'healthcare_facility_name', {
                transaction: t,
            });

            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
};
