-- Seed: waste_hierarchy (types / groups / characteristics, EN + ID names).
--
-- Source: apps/wms-service/db/seeders/20250922035943-waste_hirarchy_en.js.
-- That seeder truncates and fully replaces waste_hierarchy, so it is the definitive final state —
-- earlier seeders never populated this table with English names. This seed reproduces it as-is.
--
-- Explicit ids are required because rows self-reference via parent_hierarchy_id (e.g. id 40's
-- parent is id 10). ON CONFLICT (id) DO NOTHING makes reruns safe; the trailing setval keeps the
-- SERIAL sequence ahead of the explicit ids for any rows created later through the API.
INSERT INTO waste_hierarchy (id, created_by, updated_by, region_id, parent_hierarchy_id, name, name_en, description, description_en, level)
SELECT v.id, 'system_init', 'system_init', r.id, v.parent_id, v.name, v.name_en, v.description, v.description_en, v.level
FROM (
    VALUES
        -- Level 0: main types
        (1, NULL::integer, 'Klinis/Medis', 'Clinical/Medical',
            'Limbah yang berasal dari kegiatan pelayanan kesehatan, laboratorium, rumah sakit, puskesmas, atau kegiatan medis lainnya yang dapat bersifat infeksius maupun non-infeksius.',
            'Waste generated from healthcare services, laboratories, hospitals, community health centers, or other medical activities that can be infectious or non-infectious.', 0),
        (2, NULL::integer, 'Limbah B3', 'Hazardous and Toxic Waste (B3)',
            'Limbah yang mengandung bahan berbahaya dan beracun (B3) yang dapat mencemari lingkungan dan membahayakan kesehatan manusia.',
            'Waste containing hazardous and toxic materials (B3) that can pollute the environment and endanger human health.', 0),
        (3, NULL::integer, 'Domestic', 'Domestic',
            'Limbah rumah tangga atau sejenis sampah rumah tangga yang umumnya berasal dari aktivitas sehari-hari manusia.',
            'Household waste or similar types of waste that generally come from human daily activities.', 0),

        -- Level 1: groups (medical)
        (10, 1, 'Infeksius', 'Infectious',
            'Limbah yang terkontaminasi darah, cairan tubuh, kultur mikroorganisme, atau peralatan medis yang berpotensi menularkan penyakit.',
            'Waste contaminated with blood, body fluids, microorganism cultures, or medical equipment that can potentially transmit diseases.', 1),
        (11, 1, 'Non Infeksius', 'Non-Infectious',
            'Limbah medis yang tidak mengandung agen infeksius tetapi tetap berbahaya, misalnya limbah farmasi, kimia, sitotoksis, atau radioaktif.',
            'Medical waste that does not contain infectious agents but is still hazardous, such as pharmaceutical, chemical, cytotoxic, or radioactive waste.', 1),

        -- Level 1: group (B3)
        (20, 2, 'Limbah B3', 'Hazardous and Toxic Waste (B3)',
            'Limbah yang mengandung zat berbahaya atau beracun seperti logam berat, bahan kimia, atau residu industri.',
            'Waste containing hazardous or toxic substances such as heavy metals, chemicals, or industrial residues.', 1),

        -- Level 1: groups (domestic)
        (30, 3, 'Organik', 'Organic',
            'Sampah yang dapat terurai secara alami, seperti sisa makanan, daun, atau limbah dapur.',
            'Waste that can decompose naturally, such as food scraps, leaves, or kitchen waste.', 1),
        (31, 3, 'Anorganik', 'Inorganic',
            'Sampah yang sulit terurai secara alami seperti plastik, logam, kaca, atau material sintetis.',
            'Waste that is difficult to decompose naturally, such as plastic, metal, glass, or synthetic materials.', 1),

        -- Level 2: characteristics (medical - infectious, parent 10)
        (40, 10, 'Infeksius', 'Infectious',
            'Limbah yang mengandung patogen atau cairan tubuh yang dapat menularkan penyakit.',
            'Waste containing pathogens or body fluids that can transmit diseases.', 2),
        (41, 10, 'Infeksius Plastik', 'Infectious Plastic',
            'Limbah infeksius berbahan plastik, seperti sarung tangan, botol infus, atau tabung.',
            'Infectious waste made of plastic, such as gloves, IV bottles, or tubes.', 2),
        (42, 10, 'Infeksius Non Plastik', 'Infectious Non-Plastic',
            'Limbah infeksius selain plastik, misalnya kain kasa, perban, atau kapas.',
            'Infectious waste other than plastic, such as gauze, bandages, or cotton.', 2),
        (43, 10, 'Tajam', 'Sharps',
            'Benda tajam bekas medis seperti jarum suntik, pisau bedah, dan ampul pecah.',
            'Used medical sharps such as syringes, scalpels, and broken ampoules.', 2),
        (44, 10, 'Patologi', 'Pathological',
            'Sisa jaringan tubuh, organ, darah, atau bagian tubuh hasil operasi.',
            'Remaining body tissues, organs, blood, or body parts from surgery.', 2),

        -- Level 2: characteristics (medical - non-infectious, parent 11)
        (50, 11, 'Farmasi', 'Pharmaceutical',
            'Limbah obat kedaluwarsa atau sisa obat yang tidak terpakai.',
            'Expired medication waste or unused drug residues.', 2),
        (51, 11, 'Antimikroba/antibiotik', 'Antimicrobial/Antibiotic',
            'Sisa antibiotik atau obat antimikroba yang berpotensi menyebabkan resistensi.',
            'Antibiotic or antimicrobial drug residues that can potentially cause resistance.', 2),
        (52, 11, 'Kimia', 'Chemical',
            'Limbah bahan kimia laboratorium, reagen, atau disinfektan.',
            'Laboratory chemical waste, reagents, or disinfectants.', 2),
        (53, 11, 'Sitotoksis', 'Cytotoxic',
            'Obat kanker (kemoterapi) dan bahan terkait yang sangat beracun.',
            'Cancer drugs (chemotherapy) and related highly toxic materials.', 2),
        (54, 11, 'Radioaktif', 'Radioactive',
            'Limbah medis yang terkontaminasi isotop radioaktif dari radiologi atau kedokteran nuklir.',
            'Medical waste contaminated with radioactive isotopes from radiology or nuclear medicine.', 2),
        (55, 11, 'Kontainer Bertekanan (B3)', 'Pressurized Containers (B3)',
            'Tabung gas medis bekas, kaleng aerosol, atau kontainer bertekanan lainnya.',
            'Used medical gas cylinders, aerosol cans, or other pressurized containers.', 2),
        (56, 11, 'Logam Berat', 'Heavy Metal',
            'Limbah medis yang mengandung merkuri (termometer, tensimeter), timbal, atau logam berat lainnya.',
            'Medical waste containing mercury (thermometers, tensimeters), lead, or other heavy metals.', 2),

        -- Level 2: characteristics (B3, parent 20)
        (60, 20, 'Residu Insinerasi', 'Incineration Residue',
            'Abu atau sisa hasil pembakaran limbah yang masih mengandung B3.',
            'Ash or residue from waste incineration that still contains B3 materials.', 2),
        (61, 20, 'Elektronik', 'Electronic',
            'Limbah peralatan elektronik (e-waste) seperti komputer, TV, ponsel.',
            'Electronic equipment waste (e-waste) such as computers, TVs, and mobile phones.', 2),
        (62, 20, 'Elektronik Lampu TL', 'Electronic TL Lamps',
            'Lampu TL atau neon bekas yang mengandung merkuri.',
            'Used TL or fluorescent lamps that contain mercury.', 2),
        (63, 20, 'Elektronik Aki/Baterai Bekas', 'Used Electronic Batteries/Accumulators',
            'Baterai, aki, atau powerbank bekas yang mengandung logam berat.',
            'Used batteries, accumulators, or power banks that contain heavy metals.', 2),
        (64, 20, 'Oli', 'Used Oil',
            'Oli bekas dari mesin kendaraan atau peralatan industri.',
            'Used oil from vehicle engines or industrial equipment.', 2),
        (65, 20, 'Lumpur IPAL', 'WWTP Sludge',
            'Lumpur hasil pengolahan air limbah (IPAL) yang mengandung B3.',
            'Sludge from wastewater treatment plants (WWTP) that contains B3 materials.', 2),

        -- Level 2: characteristics (domestic, parents 30/31)
        (70, 30, 'Kertas', 'Paper',
            'Limbah kertas, karton, atau produk berbahan dasar selulosa.',
            'Waste paper, cardboard, or cellulose-based products.', 2),
        (71, 30, 'Sisa Makanan', 'Food Scraps',
            'Sampah organik dari sisa konsumsi makanan, buah, dan sayur.',
            'Organic waste from leftover food, fruits, and vegetables.', 2),
        (72, 31, 'Metal', 'Metal',
            'Limbah anorganik berbahan logam seperti kaleng, besi, aluminium.',
            'Inorganic waste made of metal such as cans, iron, and aluminum.', 2),
        (73, 31, 'Plastik', 'Plastic',
            'Limbah anorganik berbahan plastik sekali pakai atau kemasan.',
            'Inorganic waste made of disposable plastic or packaging.', 2),
        (74, 31, 'Hasil Sterilisasi/disinfeksi', 'Sterilization/Disinfection Residue',
            'Residu dari proses sterilisasi/disinfeksi limbah yang tidak dapat dimanfaatkan kembali.',
            'Residue from the sterilization/disinfection process of waste that cannot be reused.', 2)
) AS v (id, parent_id, name, name_en, description, description_en, level)
JOIN regions r ON r.code = 'INDO'
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('waste_hierarchy', 'id'),
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM waste_hierarchy), 1)
);
