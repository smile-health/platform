'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('waste_bag', null, {
            truncate: true,
            restartIdentity: true,
            cascade: true,
        });
        await queryInterface.changeColumn('waste_bag', 'waste_status', {
            type: Sequelize.ENUM(
                'IN_TEMPORARY_STORAGE',
                'IN_COLD_STORAGE',
                'INCINERATION_IN_PROCESS',
                'STERILIZATION_IN_PROCESS',
                'INCINERATED',
                'STERILISED',
                'READY_FOR_TRANSPORT',
                'IN_TRANSIT',
                'TREATED',
                'RECYCLED',
                'LANDFILLED',
                'COLLECTED',
                'DISPOSED',
            ),
            allowNull: false,
            defaultValue: 'IN_TEMPORARY_STORAGE',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('waste_bag', null, {
            truncate: true,
            restartIdentity: true,
            cascade: true,
        });
        await queryInterface.changeColumn('waste_bag', 'waste_status', {
            type: Sequelize.ENUM(
                'CREATED',
                'SCALED',
                'IN_TEMPORARY_STORAGE',
                'IN_COLD_STORAGE',
                'AUTOCLAVED',
                'INCINERATED',
                'READY_FOR_TRANSPORT',
                'IN_TRANSIT',
                'TREATED',
                'RECYCLED',
                'LANDFILLED',
                'COLLECTED_GOVERNMENT',
                'DISPOSED',
            ),
            allowNull: false,
            defaultValue: 'CREATED',
        });
    },
};
