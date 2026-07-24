'use strict';
const db = require('../models');
var initModels = require('../models/init-models');
var models = initModels(db.sequelize);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Hapus semua isi tabel waste_hierarchy sebelum seed
        await queryInterface.bulkDelete('waste_hierarchy', null, {});

        const indonesiaRegionId = 1;

        // Level 0: Tipe utama
        const wasteType = [
            {
                id: 1,
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'Klinis/Medis',
                name_en: 'Clinical/Medical',
                description:
                    'Limbah yang berasal dari kegiatan pelayanan kesehatan, laboratorium, rumah sakit, puskesmas, atau kegiatan medis lainnya yang dapat bersifat infeksius maupun non-infeksius.',
                description_en:
                    'Waste generated from healthcare services, laboratories, hospitals, community health centers, or other medical activities that can be infectious or non-infectious.',
                level: 0,
            },
            {
                id: 2,
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'Limbah B3',
                name_en: 'Hazardous and Toxic Waste (B3)',
                description:
                    'Limbah yang mengandung bahan berbahaya dan beracun (B3) yang dapat mencemari lingkungan dan membahayakan kesehatan manusia.',
                description_en:
                    'Waste containing hazardous and toxic materials (B3) that can pollute the environment and endanger human health.',
                level: 0,
            },
            {
                id: 3,
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'Domestic',
                name_en: 'Domestic',
                description:
                    'Limbah rumah tangga atau sejenis sampah rumah tangga yang umumnya berasal dari aktivitas sehari-hari manusia.',
                description_en:
                    'Household waste or similar types of waste that generally come from human daily activities.',
                level: 0,
            },
        ];

        // Level 1: Kelompok limbah medis
        const wasteGroupMedis = [
            {
                id: 10,
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'Infeksius',
                name_en: 'Infectious',
                description:
                    'Limbah yang terkontaminasi darah, cairan tubuh, kultur mikroorganisme, atau peralatan medis yang berpotensi menularkan penyakit.',
                description_en:
                    'Waste contaminated with blood, body fluids, microorganism cultures, or medical equipment that can potentially transmit diseases.',
                parent_hierarchy_id: 1,
                level: 1,
            },
            {
                id: 11,
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'Non Infeksius',
                name_en: 'Non-Infectious',
                description:
                    'Limbah medis yang tidak mengandung agen infeksius tetapi tetap berbahaya, misalnya limbah farmasi, kimia, sitotoksis, atau radioaktif.',
                description_en:
                    'Medical waste that does not contain infectious agents but is still hazardous, such as pharmaceutical, chemical, cytotoxic, or radioactive waste.',
                parent_hierarchy_id: 1,
                level: 1,
            },
        ];

        // Level 1: Kelompok limbah B3
        const wasteGroupB3 = [
            {
                id: 20,
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'Limbah B3',
                name_en: 'Hazardous and Toxic Waste (B3)',
                description:
                    'Limbah yang mengandung zat berbahaya atau beracun seperti logam berat, bahan kimia, atau residu industri.',
                description_en:
                    'Waste containing hazardous or toxic substances such as heavy metals, chemicals, or industrial residues.',
                parent_hierarchy_id: 2,
                level: 1,
            },
        ];

        // Level 1: Kelompok limbah domestik
        const wasteGroupDomestik = [
            {
                id: 30,
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'Organik',
                name_en: 'Organic',
                description:
                    'Sampah yang dapat terurai secara alami, seperti sisa makanan, daun, atau limbah dapur.',
                description_en:
                    'Waste that can decompose naturally, such as food scraps, leaves, or kitchen waste.',
                parent_hierarchy_id: 3,
                level: 1,
            },
            {
                id: 31,
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
                name: 'Anorganik',
                name_en: 'Inorganic',
                description:
                    'Sampah yang sulit terurai secara alami seperti plastik, logam, kaca, atau material sintetis.',
                description_en:
                    'Waste that is difficult to decompose naturally, such as plastic, metal, glass, or synthetic materials.',
                parent_hierarchy_id: 3,
                level: 1,
            },
        ];

        // Level 2: Karakteristik limbah medis
        const wasteCharacteristikMedis = [
            {
                id: 40,
                name: 'Infeksius',
                name_en: 'Infectious',
                description:
                    'Limbah yang mengandung patogen atau cairan tubuh yang dapat menularkan penyakit.',
                description_en:
                    'Waste containing pathogens or body fluids that can transmit diseases.',
                parent_hierarchy_id: 10,
                level: 2,
            },
            {
                id: 41,
                name: 'Infeksius Plastik',
                name_en: 'Infectious Plastic',
                description:
                    'Limbah infeksius berbahan plastik, seperti sarung tangan, botol infus, atau tabung.',
                description_en:
                    'Infectious waste made of plastic, such as gloves, IV bottles, or tubes.',
                parent_hierarchy_id: 10,
                level: 2,
            },
            {
                id: 42,
                name: 'Infeksius Non Plastik',
                name_en: 'Infectious Non-Plastic',
                description:
                    'Limbah infeksius selain plastik, misalnya kain kasa, perban, atau kapas.',
                description_en:
                    'Infectious waste other than plastic, such as gauze, bandages, or cotton.',
                parent_hierarchy_id: 10,
                level: 2,
            },
            {
                id: 43,
                name: 'Tajam',
                name_en: 'Sharps',
                description:
                    'Benda tajam bekas medis seperti jarum suntik, pisau bedah, dan ampul pecah.',
                description_en:
                    'Used medical sharps such as syringes, scalpels, and broken ampoules.',
                parent_hierarchy_id: 10,
                level: 2,
            },
            {
                id: 44,
                name: 'Patologi',
                name_en: 'Pathological',
                description: 'Sisa jaringan tubuh, organ, darah, atau bagian tubuh hasil operasi.',
                description_en:
                    'Remaining body tissues, organs, blood, or body parts from surgery.',
                parent_hierarchy_id: 10,
                level: 2,
            },
            {
                id: 50,
                name: 'Farmasi',
                name_en: 'Pharmaceutical',
                description: 'Limbah obat kedaluwarsa atau sisa obat yang tidak terpakai.',
                description_en: 'Expired medication waste or unused drug residues.',
                parent_hierarchy_id: 11,
                level: 2,
            },
            {
                id: 51,
                name: 'Antimikroba/antibiotik',
                name_en: 'Antimicrobial/Antibiotic',
                description:
                    'Sisa antibiotik atau obat antimikroba yang berpotensi menyebabkan resistensi.',
                description_en:
                    'Antibiotic or antimicrobial drug residues that can potentially cause resistance.',
                parent_hierarchy_id: 11,
                level: 2,
            },
            {
                id: 52,
                name: 'Kimia',
                name_en: 'Chemical',
                description: 'Limbah bahan kimia laboratorium, reagen, atau disinfektan.',
                description_en: 'Laboratory chemical waste, reagents, or disinfectants.',
                parent_hierarchy_id: 11,
                level: 2,
            },
            {
                id: 53,
                name: 'Sitotoksis',
                name_en: 'Cytotoxic',
                description: 'Obat kanker (kemoterapi) dan bahan terkait yang sangat beracun.',
                description_en: 'Cancer drugs (chemotherapy) and related highly toxic materials.',
                parent_hierarchy_id: 11,
                level: 2,
            },
            {
                id: 54,
                name: 'Radioaktif',
                name_en: 'Radioactive',
                description:
                    'Limbah medis yang terkontaminasi isotop radioaktif dari radiologi atau kedokteran nuklir.',
                description_en:
                    'Medical waste contaminated with radioactive isotopes from radiology or nuclear medicine.',
                parent_hierarchy_id: 11,
                level: 2,
            },
            {
                id: 55,
                name: 'Kontainer Bertekanan (B3)',
                name_en: 'Pressurized Containers (B3)',
                description:
                    'Tabung gas medis bekas, kaleng aerosol, atau kontainer bertekanan lainnya.',
                description_en:
                    'Used medical gas cylinders, aerosol cans, or other pressurized containers.',
                parent_hierarchy_id: 11,
                level: 2,
            },
            {
                id: 56,
                name: 'Logam Berat',
                name_en: 'Heavy Metal',
                description:
                    'Limbah medis yang mengandung merkuri (termometer, tensimeter), timbal, atau logam berat lainnya.',
                description_en:
                    'Medical waste containing mercury (thermometers, tensimeters), lead, or other heavy metals.',
                parent_hierarchy_id: 11,
                level: 2,
            },
        ].map((item) =>
            Object.assign({}, item, {
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
            }),
        );

        // Level 2: Karakteristik limbah B3
        const wasteCharacteristicsB3 = [
            {
                id: 60,
                name: 'Residu Insinerasi',
                name_en: 'Incineration Residue',
                description: 'Abu atau sisa hasil pembakaran limbah yang masih mengandung B3.',
                description_en:
                    'Ash or residue from waste incineration that still contains B3 materials.',
                parent_hierarchy_id: 20,
                level: 2,
            },
            {
                id: 61,
                name: 'Elektronik',
                name_en: 'Electronic',
                description: 'Limbah peralatan elektronik (e-waste) seperti komputer, TV, ponsel.',
                description_en:
                    'Electronic equipment waste (e-waste) such as computers, TVs, and mobile phones.',
                parent_hierarchy_id: 20,
                level: 2,
            },
            {
                id: 62,
                name: 'Elektronik Lampu TL',
                name_en: 'Electronic TL Lamps',
                description: 'Lampu TL atau neon bekas yang mengandung merkuri.',
                description_en: 'Used TL or fluorescent lamps that contain mercury.',
                parent_hierarchy_id: 20,
                level: 2,
            },
            {
                id: 63,
                name: 'Elektronik Aki/Baterai Bekas',
                name_en: 'Used Electronic Batteries/Accumulators',
                description: 'Baterai, aki, atau powerbank bekas yang mengandung logam berat.',
                description_en:
                    'Used batteries, accumulators, or power banks that contain heavy metals.',
                parent_hierarchy_id: 20,
                level: 2,
            },
            {
                id: 64,
                name: 'Oli',
                name_en: 'Used Oil',
                description: 'Oli bekas dari mesin kendaraan atau peralatan industri.',
                description_en: 'Used oil from vehicle engines or industrial equipment.',
                parent_hierarchy_id: 20,
                level: 2,
            },
            {
                id: 65,
                name: 'Lumpur IPAL',
                name_en: 'WWTP Sludge',
                description: 'Lumpur hasil pengolahan air limbah (IPAL) yang mengandung B3.',
                description_en:
                    'Sludge from wastewater treatment plants (WWTP) that contains B3 materials.',
                parent_hierarchy_id: 20,
                level: 2,
            },
        ].map((item) =>
            Object.assign({}, item, {
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
            }),
        );

        // Level 2: Karakteristik limbah domestik
        const wasteCharacteristicDomestic = [
            {
                id: 70,
                name: 'Kertas',
                name_en: 'Paper',
                description: 'Limbah kertas, karton, atau produk berbahan dasar selulosa.',
                description_en: 'Waste paper, cardboard, or cellulose-based products.',
                parent_hierarchy_id: 30,
                level: 2,
            },
            {
                id: 71,
                name: 'Sisa Makanan',
                name_en: 'Food Scraps',
                description: 'Sampah organik dari sisa konsumsi makanan, buah, dan sayur.',
                description_en: 'Organic waste from leftover food, fruits, and vegetables.',
                parent_hierarchy_id: 30,
                level: 2,
            },
            {
                id: 72,
                name: 'Metal',
                name_en: 'Metal',
                description: 'Limbah anorganik berbahan logam seperti kaleng, besi, aluminium.',
                description_en: 'Inorganic waste made of metal such as cans, iron, and aluminum.',
                parent_hierarchy_id: 31,
                level: 2,
            },
            {
                id: 73,
                name: 'Plastik',
                name_en: 'Plastic',
                description: 'Limbah anorganik berbahan plastik sekali pakai atau kemasan.',
                description_en: 'Inorganic waste made of disposable plastic or packaging.',
                parent_hierarchy_id: 31,
                level: 2,
            },
            {
                id: 74,
                name: 'Hasil Sterilisasi/disinfeksi',
                name_en: 'Sterilization/Disinfection Residue',
                description:
                    'Residu dari proses sterilisasi/disinfeksi limbah yang tidak dapat dimanfaatkan kembali.',
                description_en:
                    'Residue from the sterilization/disinfection process of waste that cannot be reused.',
                parent_hierarchy_id: 31,
                level: 2,
            },
        ].map((item) =>
            Object.assign({}, item, {
                created_by: 'system_init',
                updated_by: 'system_init',
                region_id: indonesiaRegionId,
            }),
        );

        await models.waste_hierarchy.bulkCreate([
            ...wasteType,
            ...wasteGroupMedis,
            ...wasteGroupB3,
            ...wasteGroupDomestik,
            ...wasteCharacteristikMedis,
            ...wasteCharacteristicsB3,
            ...wasteCharacteristicDomestic,
        ]);
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
