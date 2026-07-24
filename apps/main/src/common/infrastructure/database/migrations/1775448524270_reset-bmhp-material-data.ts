import type { Kysely } from "kysely"

const BMHP_MATERIAL_ROWS = [
  { name: "Reagen diluent", is_reagen: 1 },
  { name: "Reagen cleanser", is_reagen: 1 },
  { name: "Reagen lyse", is_reagen: 1 },
  { name: "Reagen control", is_reagen: 1 },
  { name: "Reagensia Cholesterol Total", is_reagen: 1 },
  { name: "Reagensia HDL Direct", is_reagen: 1 },
  { name: "Reagensia LDL Direct", is_reagen: 1 },
  { name: "Reagensia Trigliserida", is_reagen: 1 },
  { name: "Reagen kreatinin", is_reagen: 1 },
  { name: "Reagen Ureum", is_reagen: 1 },
  { name: "Cartridge TCM", is_reagen: 0 },
  { name: "Reagensia BTA", is_reagen: 1 },
  { name: "Dental plaque disclosing", is_reagen: 1 },
  { name: "Reagen SGOT", is_reagen: 1 },
  {
    name: "Reagensia Malaria (metanol, immertion oil dan giemsa)",
    is_reagen: 1,
  },
  { name: "Kapas", is_reagen: 0 },
  { name: "Gel EKG", is_reagen: 0 },
  { name: "Gel USG", is_reagen: 0 },
  { name: "Blood Lancet", is_reagen: 0 },
  { name: "Vacutainer Needle", is_reagen: 0 },
  { name: "Tabung vacutainer tutup ungu (EDTA) (K2/K3)", is_reagen: 0 },
  { name: "Tabung vacutainer tutup kuning", is_reagen: 0 },
  { name: "Tip Kuning", is_reagen: 0 },
  { name: "Alcohol Swab", is_reagen: 0 },
  { name: "Handscoon", is_reagen: 0 },
  { name: "plester bulat bening", is_reagen: 0 },
  { name: "Strip gula darah", is_reagen: 0 },
  { name: "Wing needle", is_reagen: 0 },
  { name: "Strip Hb", is_reagen: 0 },
  { name: "Lancet Pediatric", is_reagen: 0 },
  { name: "Plester", is_reagen: 0 },
  { name: "Thermal paper EKG", is_reagen: 0 },
  { name: "Pot Sputum", is_reagen: 0 },
  { name: "Tuberkulin Vial", is_reagen: 0 },
  { name: "Rapid test Hepatitis B (HBsAg)", is_reagen: 0 },
  { name: "Rapid Test HIV", is_reagen: 0 },
  { name: "Rapid Test HIV dan Sifilis combo/dual", is_reagen: 0 },
  { name: "Rapid Test Sifilis", is_reagen: 0 },
  { name: "Glukuproteinuria", is_reagen: 0 },
  { name: "Pot urine", is_reagen: 0 },
  { name: "Dental Kit", is_reagen: 0 },
  { name: "Fluorida Varnish", is_reagen: 0 },
  { name: "Microbrush", is_reagen: 0 },
  { name: "Rapid test Hepatitis C (anti HCV)", is_reagen: 0 },
  { name: "Fecal OBT", is_reagen: 0 },
  { name: "Pot Sample Feses", is_reagen: 0 },
  { name: "Collecting Kit (cytobrush + VTM)", is_reagen: 0 },
  { name: "Rapid Test Malaria", is_reagen: 0 },
  { name: "Plester bulat bening", is_reagen: 0 },
  { name: "Tabung vacutainer tutup ungu", is_reagen: 0 },
  { name: "Vacutainer tutup merah", is_reagen: 0 },
  { name: "Tabung vacutainer tutup ungu (EDTA)", is_reagen: 0 },
  { name: "Kertas Saring", is_reagen: 0 },
  { name: "Plastik klip", is_reagen: 0 },
  { name: "Cawan", is_reagen: 0 },
  { name: "Celemek Dental", is_reagen: 0 },
]

const ALL_MERKS: Array<{ name: string; code: string }> = [
  { name: "Dental varnish", code: "PKG-NMD-001" },
  { name: "Medical adhesive tape", code: "PKG-NMD-002" },
  { name: "Hemoglobin test strip", code: "PKG-NMD-003" },
  {
    name: "Patient Examination Glove L Nitrile Powder Free Non Steril",
    code: "PKG-NMD-004",
  },
  {
    name: "Patient Examination Glove M Latex Powder free Non Steril",
    code: "PKG-NMD-005",
  },
  {
    name: "Patient Examination Glove M Latex Powdered/Pre Powdered Non Steril",
    code: "PKG-NMD-006",
  },
  { name: "Blood cell diluents", code: "PKG-NMD-007" },
  {
    name: "Vacuum Blood Collection Tube K3 EDTA PET 3 mL",
    code: "PKG-NMD-008",
  },
  {
    name: "Vacuum Blood Collection Tube K2 EDTA PET 2 mL",
    code: "PKG-NMD-009",
  },
  {
    name: "Vacuum Blood Collection Tube K2 EDTA PET 3 mL",
    code: "PKG-NMD-010",
  },
  { name: "Vacuum Blood Collection Tube Plain PET 3 mL", code: "PKG-NMD-011" },
  { name: "Lancet Stainless", code: "PKG-NMD-012" },
  { name: "Micropippette Tips", code: "PKG-NMD-013" },
  { name: "HBsAg Test Card", code: "PKG-NMD-014" },
  {
    name: "Patient Examination Glove M Nitrile Powder Free Non Steril",
    code: "PKG-NMD-015",
  },
  { name: "Glucose Test Strip", code: "PKG-NMD-016" },
  { name: "Disposable lancet 28G", code: "PKG-NMD-017" },
  {
    name: "Treponema pallidum treponemal antibody test card/cassette",
    code: "PKG-NMD-018",
  },
  { name: "Cholesterol (total) test kit", code: "PKG-NMD-019" },
  { name: "Creatine test reagen kit", code: "PKG-NMD-020" },
  { name: "High density lipoprotein (HDL) test kit", code: "PKG-NMD-021" },
  { name: "AST/SGOT test kit", code: "PKG-NMD-022" },
  { name: "Triglyceride test kit", code: "PKG-NMD-023" },
  { name: "Urea nitrogen test reagen kit", code: "PKG-NMD-024" },
  { name: "HIV test card/ cassette", code: "PKG-NMD-025" },
  { name: "HBsAg Test Strip", code: "PKG-NMD-026" },
  { name: "HCV Test Card/Cassette", code: "PKG-NMD-027" },
  { name: "Collection swab & virus sampling tube", code: "PKG-NMD-028" },
  {
    name: "Dye and Chemical Solution Stains Ziehl Neelsen Solution",
    code: "PKG-NMD-029",
  },
  { name: "Alcohol Swab", code: "PKG-NMD-030" },
  { name: "Alc", code: "PKG-NMD-031" },
  { name: "Malaria Test Card/Cassette", code: "PKG-NMD-032" },
  { name: "Lipoprotein test reagent kit", code: "PKG-NMD-033" },
  { name: "HCV Reagent Test Strip", code: "PKG-NMD-034" },
  { name: "Specimen container sterile 60 mL", code: "PKG-NMD-035" },
  {
    name: "Vacuum Blood Collection Tube Clot Activator PET 3 mL",
    code: "PKG-NMD-036",
  },
  {
    name: "Vacuum Blood Collection Tube Clot Activator PET 2 mL",
    code: "PKG-NMD-037",
  },
  {
    name: "Vacuum Blood Collection Tube Gel and Clot Activator PET 2 mL",
    code: "PKG-NMD-038",
  },
  {
    name: "Vacuum Blood Collection Tube Gel and Clot Activator PET 3 mL",
    code: "PKG-NMD-039",
  },
  {
    name: "Vacuum Blood Collection Tube K3 EDTA PET 2 mL",
    code: "PKG-NMD-040",
  },
  { name: "Viral transport medium (VTM)", code: "PKG-NMD-041" },
  {
    name: "Patient examination glove L latex powder free non steril",
    code: "PKG-NMD-042",
  },
  {
    name: "Patient Examination Glove S Latex Powder free Non Steril",
    code: "PKG-NMD-043",
  },
  { name: "Bahan Pemeriksaan Malaria", code: "PKG-NMD-044" },
  { name: "Ultrasound gel", code: "PKG-NMD-045" },
  { name: "Plaque Disclosing Solution", code: "PKG-NMD-046" },
  { name: "Dental varnish with flouride liquid", code: "PKG-NMD-047" },
  { name: "Blood collection safety holder disposable", code: "PKG-NMD-048" },
  { name: "Wing needle blood collection set", code: "PKG-NMD-049" },
  { name: "Cholesterol (total) test reagent", code: "PKG-NMD-050" },
  { name: "Clinical chemistry calibrator liquid", code: "PKG-NMD-051" },
  { name: "Multiple Autoantibodies Test", code: "PKG-NMD-052" },
  { name: "Urine test strip (14 parameters)", code: "PKG-NMD-053" },
  { name: "Red cell lysing reagent", code: "PKG-NMD-054" },
  { name: "ECG Paper", code: "PKG-NMD-055" },
  {
    name: "Medical absorbent cotton (kapas pembalut) 250 gr",
    code: "PKG-NMD-056",
  },
  { name: "Vaginal Self Collection and Transport Swab", code: "PKG-NMD-057" },
  {
    name: "Medical absorbent cotton (kapas pembalut) 100 gr",
    code: "PKG-NMD-058",
  },
  {
    name: "Medical absorbent cotton (kapas pembalut) 500 gr",
    code: "PKG-NMD-059",
  },
  {
    name: "Patient Examination Glove L Latex Powdered/Pre Powdered Non Steril",
    code: "PKG-NMD-060",
  },
  {
    name: "Patient Examination Glove S Latex Powdered/Pre Powdered Non Steril",
    code: "PKG-NMD-061",
  },
  { name: "Creatinine test kit", code: "PKG-NMD-062" },
  { name: "High density lipoprotein (HDL) test reagent", code: "PKG-NMD-063" },
  { name: "Urea nitrogen test reagent", code: "PKG-NMD-064" },
  { name: "Lain-lain", code: "PKG-NMD-065" },
  { name: "HIV & Syphilis Rapid Test", code: "PKG-NMD-066" },
  { name: "Dental restorative set", code: "PKG-NMD-067" },
  { name: "Dental surgical set", code: "PKG-NMD-068" },
  {
    name: "Specimen transport and storage container non steril",
    code: "PKG-NMD-069",
  },
  { name: "Lyse reagent", code: "PKG-NMD-070" },
  { name: "Adhesive bandage steril", code: "PKG-NMD-071" },
  {
    name: "Specimen transport and storage container steril",
    code: "PKG-NMD-072",
  },
  { name: "Occult blood test Cassette", code: "PKG-NMD-073" },
  { name: "Stick swab (cotton/ flock)", code: "PKG-NMD-074" },
  {
    name: "MTB and resistance RIF & INH (MDR TB) molecular tests",
    code: "PKG-NMD-075",
  },
  { name: "Urine test strip (10 parameters)", code: "PKG-NMD-076" },
  { name: "Urine test strip (3 parameters)", code: "PKG-NMD-077" },
  { name: "Hematology Analyzer Reagent Kit 5 Diff", code: "PKG-NMD-078" },
  { name: "Medical absorbent cotton stick", code: "PKG-NMD-079" },
  {
    name: "General purpose solution for in vitro diagnostik",
    code: "PKG-NMD-080",
  },
  { name: "Cleaning solution", code: "PKG-NMD-081" },
  { name: "Hematology Quality Control Mixture", code: "PKG-NMD-082" },
  { name: "Dental varnish with flouride gel", code: "PKG-NMD-083" },
  { name: "Immersion Oil", code: "PKG-NMD-084" },
  { name: "Scalp Vein Set 27 G", code: "PKG-NMD-085" },
  { name: "Cotton Applicators Wood Tidak Steril", code: "PKG-NMD-086" },
  { name: "Cotton Applicators Wood Steril", code: "PKG-NMD-087" },
  { name: "Low density lipoprotein (LDL) test kit", code: "PKG-NMD-088" },
  { name: "Triglyceride test reagent", code: "PKG-NMD-089" },
  { name: "Micro brush for fluoride varnish", code: "PKG-NMD-090" },
  { name: "Cleanser/ wash solution for instrument", code: "PKG-NMD-091" },
  { name: "Hematology Analyzer Reagent Kit 3 Diff", code: "PKG-NMD-092" },
  {
    name: "Patient Examination Glove XS Latex Powdered/Pre Powdered Non Steril",
    code: "PKG-NMD-093",
  },
  {
    name: "Patient examination glove XL latex powdered/pre powdered non steril",
    code: "PKG-NMD-094",
  },
  { name: "Scalp Vein Set 23 G", code: "PKG-NMD-095" },
  { name: "Disposable lancet 26G", code: "PKG-NMD-096" },
  { name: "Electrode gel", code: "PKG-NMD-097" },
  { name: "Dental bib disposable", code: "PKG-NMD-098" },
  {
    name: "Patient examination glove L latex powder free steril",
    code: "PKG-NMD-099",
  },
  {
    name: "Patient Examination Glove M Latex Powder free Steril",
    code: "PKG-NMD-100",
  },
  {
    name: "Patient examination glove S latex powder free steril",
    code: "PKG-NMD-101",
  },
  {
    name: "Patient Examination Glove L Nitrile Powder Free Steril",
    code: "PKG-NMD-102",
  },
  {
    name: "Patient examination glove M nitrile powder free steril",
    code: "PKG-NMD-103",
  },
  {
    name: "Patient examination glove S nitrile powder free steril",
    code: "PKG-NMD-104",
  },
  { name: "Non Woven Adhesive", code: "PKG-NMD-105" },
  { name: "Adhesive bandage non steril", code: "PKG-NMD-106" },
  { name: "Scalp Vein Set 19 G", code: "PKG-NMD-107" },
  { name: "Scalp Vein Set 25 G", code: "PKG-NMD-108" },
  {
    name: "Nontreponemal syphilis antigen test card/cassette",
    code: "PKG-NMD-109",
  },
  { name: "Pot Dahak", code: "PKG-NMD-110" },
  { name: "Hemoglobin test kit", code: "PKG-NMD-111" },
  {
    name: "Nontreponemal syphilis antibody test card/cassette",
    code: "PKG-NMD-112",
  },
  { name: "Diff lyse reagent", code: "PKG-NMD-113" },
  { name: "Mycobacterium tuberculosis IgG/IgM test kit", code: "PKG-NMD-114" },
  {
    name: "Tuberculin Purified Protein Derivative 5 TU/0,1 mL Larutan Injeksi",
    code: "PKG-NMD-115",
  },
  {
    name: "Tuberculin Purified Protein Derivative RT23 0,4 mcg/0,1 mL Suspensi Injeksi",
    code: "PKG-NMD-116",
  },
  { name: "MTB pre-treatment reagent", code: "PKG-NMD-117" },
  { name: "Urine test strip (11 parameters)", code: "PKG-NMD-118" },
  { name: "Mycobacterium tuberculosis PCR test kit", code: "PKG-NMD-119" },
]

const BMHP_MERK_PAIRS: Array<{ bmhp: string; merk: string }> = [
  { bmhp: "Fluorida Varnish", merk: "Dental varnish" },
  { bmhp: "Plester", merk: "Medical adhesive tape" },
  { bmhp: "Strip Hb", merk: "Hemoglobin test strip" },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove L Nitrile Powder Free Non Steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove M Latex Powder free Non Steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove M Latex Powdered/Pre Powdered Non Steril",
  },
  { bmhp: "Reagen lyse", merk: "Blood cell diluents" },
  { bmhp: "Reagen diluent", merk: "Blood cell diluents" },
  {
    bmhp: "Tabung vacutainer tutup ungu (EDTA)",
    merk: "Vacuum Blood Collection Tube K3 EDTA PET 3 mL",
  },
  {
    bmhp: "Tabung vacutainer tutup ungu (EDTA)",
    merk: "Vacuum Blood Collection Tube K2 EDTA PET 2 mL",
  },
  {
    bmhp: "Tabung vacutainer tutup ungu (EDTA)",
    merk: "Vacuum Blood Collection Tube K2 EDTA PET 3 mL",
  },
  {
    bmhp: "Vacutainer tutup merah",
    merk: "Vacuum Blood Collection Tube Plain PET 3 mL",
  },
  { bmhp: "Blood Lancet", merk: "Lancet Stainless" },
  { bmhp: "Lancet Pediatric", merk: "Lancet Stainless" },
  { bmhp: "Tip Kuning", merk: "Micropippette Tips" },
  { bmhp: "Rapid test Hepatitis B (HBsAg)", merk: "HBsAg Test Card" },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove M Nitrile Powder Free Non Steril",
  },
  { bmhp: "Strip gula darah", merk: "Glucose Test Strip" },
  { bmhp: "Blood Lancet", merk: "Disposable lancet 28G" },
  { bmhp: "Lancet Pediatric", merk: "Disposable lancet 28G" },
  {
    bmhp: "Rapid Test Sifilis",
    merk: "Treponema pallidum treponemal antibody test card/cassette",
  },
  { bmhp: "Reagensia Cholesterol Total", merk: "Cholesterol (total) test kit" },
  { bmhp: "Reagen kreatinin", merk: "Creatine test reagen kit" },
  {
    bmhp: "Reagensia HDL Direct",
    merk: "High density lipoprotein (HDL) test kit",
  },
  { bmhp: "Reagen SGOT", merk: "AST/SGOT test kit" },
  { bmhp: "Reagensia Trigliserida", merk: "Triglyceride test kit" },
  { bmhp: "Reagen Ureum", merk: "Urea nitrogen test reagen kit" },
  { bmhp: "Rapid Test HIV", merk: "HIV test card/ cassette" },
  { bmhp: "Rapid test Hepatitis B (HBsAg)", merk: "HBsAg Test Strip" },
  { bmhp: "Rapid test Hepatitis C (anti HCV)", merk: "HCV Test Card/Cassette" },
  {
    bmhp: "Collecting Kit (cytobrush + VTM)",
    merk: "Collection swab & virus sampling tube",
  },
  {
    bmhp: "Reagensia BTA",
    merk: "Dye and Chemical Solution Stains Ziehl Neelsen Solution",
  },
  { bmhp: "Alcohol Swab", merk: "Alcohol Swab" },
  { bmhp: "Reagen diluent", merk: "Alc" },
  { bmhp: "Rapid Test Malaria", merk: "Malaria Test Card/Cassette" },
  { bmhp: "Reagensia HDL Direct", merk: "Lipoprotein test reagent kit" },
  { bmhp: "Rapid test Hepatitis C (anti HCV)", merk: "HCV Reagent Test Strip" },
  { bmhp: "Pot urine", merk: "Specimen container sterile 60 mL" },
  { bmhp: "Pot Sputum", merk: "Specimen container sterile 60 mL" },
  {
    bmhp: "Vacutainer tutup merah",
    merk: "Vacuum Blood Collection Tube Clot Activator PET 3 mL",
  },
  {
    bmhp: "Vacutainer tutup merah",
    merk: "Vacuum Blood Collection Tube Clot Activator PET 2 mL",
  },
  {
    bmhp: "Tabung vacutainer tutup kuning",
    merk: "Vacuum Blood Collection Tube Gel and Clot Activator PET 2 mL",
  },
  {
    bmhp: "Tabung vacutainer tutup kuning",
    merk: "Vacuum Blood Collection Tube Gel and Clot Activator PET 3 mL",
  },
  {
    bmhp: "Tabung vacutainer tutup ungu (EDTA)",
    merk: "Vacuum Blood Collection Tube K3 EDTA PET 2 mL",
  },
  {
    bmhp: "Collecting Kit (cytobrush + VTM)",
    merk: "Viral transport medium (VTM)",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient examination glove L latex powder free non steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove S Latex Powder free Non Steril",
  },
  {
    bmhp: "Reagensia Malaria (metanol, immertion oil dan giemsa)",
    merk: "Bahan Pemeriksaan Malaria",
  },
  { bmhp: "Gel USG", merk: "Ultrasound gel" },
  { bmhp: "Gel EKG", merk: "Ultrasound gel" },
  { bmhp: "Dental plaque disclosing", merk: "Plaque Disclosing Solution" },
  { bmhp: "Fluorida Varnish", merk: "Dental varnish with flouride liquid" },
  {
    bmhp: "Vacutainer Needle",
    merk: "Blood collection safety holder disposable",
  },
  { bmhp: "Wing needle", merk: "Wing needle blood collection set" },
  {
    bmhp: "Reagensia Cholesterol Total",
    merk: "Cholesterol (total) test reagent",
  },
  { bmhp: "Reagen control", merk: "Clinical chemistry calibrator liquid" },
  {
    bmhp: "Rapid Test HIV dan Sifilis combo/dual",
    merk: "Multiple Autoantibodies Test",
  },
  { bmhp: "Glukuproteinuria", merk: "Urine test strip (14 parameters)" },
  { bmhp: "Reagen lyse", merk: "Red cell lysing reagent" },
  { bmhp: "Thermal paper EKG", merk: "ECG Paper" },
  { bmhp: "Kapas", merk: "Medical absorbent cotton (kapas pembalut) 250 gr" },
  {
    bmhp: "Collecting Kit (cytobrush + VTM)",
    merk: "Vaginal Self Collection and Transport Swab",
  },
  { bmhp: "Kapas", merk: "Medical absorbent cotton (kapas pembalut) 100 gr" },
  { bmhp: "Kapas", merk: "Medical absorbent cotton (kapas pembalut) 500 gr" },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove L Latex Powdered/Pre Powdered Non Steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove S Latex Powdered/Pre Powdered Non Steril",
  },
  { bmhp: "Reagen kreatinin", merk: "Creatinine test kit" },
  {
    bmhp: "Reagensia HDL Direct",
    merk: "High density lipoprotein (HDL) test reagent",
  },
  { bmhp: "Reagen Ureum", merk: "Urea nitrogen test reagent" },
  { bmhp: "Reagen control", merk: "Lain-lain" },
  { bmhp: "Rapid Test HIV", merk: "HIV & Syphilis Rapid Test" },
  {
    bmhp: "Rapid Test HIV dan Sifilis combo/dual",
    merk: "HIV & Syphilis Rapid Test",
  },
  { bmhp: "Dental Kit", merk: "Dental restorative set" },
  { bmhp: "Dental Kit", merk: "Dental surgical set" },
  {
    bmhp: "Pot Sample Feses",
    merk: "Specimen transport and storage container non steril",
  },
  { bmhp: "Reagensia Cholesterol Total", merk: "Lain-lain" },
  { bmhp: "Reagensia LDL Direct", merk: "Lipoprotein test reagent kit" },
  { bmhp: "Reagen lyse", merk: "Lyse reagent" },
  { bmhp: "plester bulat bening", merk: "Adhesive bandage steril" },
  { bmhp: "Plester", merk: "Adhesive bandage steril" },
  { bmhp: "Plester bulat bening", merk: "Adhesive bandage steril" },
  {
    bmhp: "Pot Sputum",
    merk: "Specimen transport and storage container steril",
  },
  {
    bmhp: "Pot urine",
    merk: "Specimen transport and storage container steril",
  },
  { bmhp: "Fecal OBT", merk: "Occult blood test Cassette" },
  { bmhp: "Kapas", merk: "Stick swab (cotton/ flock)" },
  {
    bmhp: "Cartridge TCM",
    merk: "MTB and resistance RIF & INH (MDR TB) molecular tests",
  },
  { bmhp: "Reagen kreatinin", merk: "Lain-lain" },
  { bmhp: "Reagensia HDL Direct", merk: "Cholesterol (total) test kit" },
  { bmhp: "Reagensia LDL Direct", merk: "Lain-lain" },
  { bmhp: "Reagensia Trigliserida", merk: "Lain-lain" },
  { bmhp: "Reagen Ureum", merk: "Lain-lain" },
  { bmhp: "Glukuproteinuria", merk: "Urine test strip (10 parameters)" },
  { bmhp: "Glukuproteinuria", merk: "Urine test strip (3 parameters)" },
  { bmhp: "Reagen diluent", merk: "Hematology Analyzer Reagent Kit 5 Diff" },
  { bmhp: "Reagen cleanser", merk: "Hematology Analyzer Reagent Kit 5 Diff" },
  { bmhp: "Reagen lyse", merk: "Hematology Analyzer Reagent Kit 5 Diff" },
  { bmhp: "Kapas", merk: "Medical absorbent cotton stick" },
  {
    bmhp: "Reagen cleanser",
    merk: "General purpose solution for in vitro diagnostik",
  },
  { bmhp: "Reagen cleanser", merk: "Cleaning solution" },
  { bmhp: "Reagen control", merk: "Hematology Quality Control Mixture" },
  { bmhp: "Reagensia LDL Direct", merk: "Cholesterol (total) test kit" },
  { bmhp: "Fluorida Varnish", merk: "Dental varnish with flouride gel" },
  { bmhp: "Reagensia BTA", merk: "Immersion Oil" },
  {
    bmhp: "Reagensia Malaria (metanol, immertion oil dan giemsa)",
    merk: "Immersion Oil",
  },
  { bmhp: "Wing needle", merk: "Scalp Vein Set 27 G" },
  { bmhp: "Kapas", merk: "Cotton Applicators Wood Tidak Steril" },
  { bmhp: "Kapas", merk: "Cotton Applicators Wood Steril" },
  {
    bmhp: "Reagensia LDL Direct",
    merk: "Low density lipoprotein (LDL) test kit",
  },
  { bmhp: "Reagen SGOT", merk: "Lain-lain" },
  { bmhp: "Reagensia LDL Direct", merk: "Cholesterol (total) test reagent" },
  { bmhp: "Reagensia Trigliserida", merk: "Triglyceride test reagent" },
  { bmhp: "Microbrush", merk: "Micro brush for fluoride varnish" },
  { bmhp: "Reagen cleanser", merk: "Cleanser/ wash solution for instrument" },
  { bmhp: "Reagen cleanser", merk: "Hematology Analyzer Reagent Kit 3 Diff" },
  { bmhp: "Reagen lyse", merk: "Hematology Analyzer Reagent Kit 3 Diff" },
  { bmhp: "Reagen diluent", merk: "Hematology Analyzer Reagent Kit 3 Diff" },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove XS Latex Powdered/Pre Powdered Non Steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient examination glove XL latex powdered/pre powdered non steril",
  },
  { bmhp: "Wing needle", merk: "Scalp Vein Set 23 G" },
  { bmhp: "Blood Lancet", merk: "Disposable lancet 26G" },
  { bmhp: "Gel EKG", merk: "Electrode gel" },
  { bmhp: "Gel USG", merk: "Electrode gel" },
  { bmhp: "Celemek Dental", merk: "Dental bib disposable" },
  {
    bmhp: "Handscoon",
    merk: "Patient examination glove L latex powder free steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove M Latex Powder free Steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient examination glove S latex powder free steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient Examination Glove L Nitrile Powder Free Steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient examination glove M nitrile powder free steril",
  },
  {
    bmhp: "Handscoon",
    merk: "Patient examination glove S nitrile powder free steril",
  },
  { bmhp: "Plester", merk: "Non Woven Adhesive" },
  { bmhp: "Plester", merk: "Adhesive bandage non steril" },
  { bmhp: "Wing needle", merk: "Scalp Vein Set 19 G" },
  { bmhp: "Wing needle", merk: "Scalp Vein Set 25 G" },
  {
    bmhp: "Rapid Test Sifilis",
    merk: "Nontreponemal syphilis antigen test card/cassette",
  },
  { bmhp: "Pot Sputum", merk: "Pot Dahak" },
  { bmhp: "Strip Hb", merk: "Hemoglobin test kit" },
  {
    bmhp: "Rapid Test Sifilis",
    merk: "Nontreponemal syphilis antibody test card/cassette",
  },
  { bmhp: "Reagen lyse", merk: "Diff lyse reagent" },
  { bmhp: "Reagen lyse", merk: "Hematology analyzer reagent kit 5 Diff" },
  { bmhp: "Reagen control", merk: "Hematology Analyzer Reagent Kit 5 Diff" },
  { bmhp: "Reagensia HDL Direct", merk: "Lain-lain" },
  {
    bmhp: "Cartridge TCM",
    merk: "Mycobacterium tuberculosis IgG/IgM test kit",
  },
  {
    bmhp: "Tuberkulin Vial",
    merk: "Tuberculin Purified Protein Derivative 5 TU/0,1 mL Larutan Injeksi",
  },
  {
    bmhp: "Tuberkulin Vial",
    merk: "Tuberculin Purified Protein Derivative RT23 0,4 mcg/0,1 mL Suspensi Injeksi",
  },
  { bmhp: "Reagen cleanser", merk: "MTB pre-treatment reagent" },
  { bmhp: "Glukuproteinuria", merk: "Urine test strip (11 parameters)" },
  { bmhp: "Cartridge TCM", merk: "Mycobacterium tuberculosis PCR test kit" },
]

const BATCH = 50

async function fetchBMHPPlanIds(db: Kysely<any>): Promise<number[]> {
  const bmhpApproach = await db
    .selectFrom("plan_approaches")
    .select("id")
    .where("name", "=", "BMHP")
    .where("deleted_at", "is", null)
    .executeTakeFirst()
  if (!bmhpApproach) return []

  const programPlans: any[] = await db
    .selectFrom("ws_program_plans")
    .select("id")
    .where("approach_id", "=", bmhpApproach.id)
    .where("year", ">=", 2026)
    .where("deleted_at", "is", null)
    .execute()

  return programPlans.map((pp) => Number(pp.id))
}

async function batchDeleteById(
  db: Kysely<any>,
  table: string,
  ids: number[]
): Promise<void> {
  for (let i = 0; i < ids.length; i += BATCH) {
    await db
      .deleteFrom(table as any)
      .where("id", "in", ids.slice(i, i + BATCH))
      .execute()
  }
}

export async function up(db: Kysely<any>): Promise<void> {
  const programPlanIds = await fetchBMHPPlanIds(db)
  if (programPlanIds.length === 0) return

  // ── Step 1: Collect all IDs before delete ─────────────────────────────────
  const bmhpMaterialRows: any[] = await db
    .selectFrom("bmhp_materials")
    .select("id")
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const bmhpMaterialIds = bmhpMaterialRows.map((r) => Number(r.id))

  const variantRows: any[] = await db
    .selectFrom("ws_bmhp_material_variant")
    .select(["id", "material_id", "program_plan_id"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const variantIds = variantRows.map((r) => Number(r.id))
  const variantIdByMaterialAndPlan = new Map<string, number>(
    variantRows.map((r) => [
      `${r.material_id}__${r.program_plan_id}`,
      Number(r.id),
    ])
  )

  let materialDetailIds: number[] = []
  if (bmhpMaterialIds.length > 0) {
    const mdRows: any[] = await db
      .selectFrom("ws_bmhp_material_details")
      .select("id")
      .where("bmhp_material_id", "in", bmhpMaterialIds)
      .where("deleted_at", "is", null)
      .execute()
    materialDetailIds = mdRows.map((r) => Number(r.id))
  }

  // ── Step 2: Save variant details in-memory ────────────────────────────────
  const savedVariantDetails = new Map<
    number,
    Array<{
      lv3_id: number
      name: string
      test_qty: number | null
      unit_id: number | null
    }>
  >()

  if (variantIds.length > 0) {
    const detailRows: any[] = await db
      .selectFrom("ws_bmhp_material_variant_detail")
      .select([
        "material_variant_id",
        "material_id",
        "name",
        "test_qty",
        "unit_id",
      ])
      .where("material_variant_id", "in", variantIds)
      .execute()

    const lv2ByVariantId = new Map<number, number>(
      variantRows.map((r) => [Number(r.id), Number(r.material_id)])
    )

    for (const row of detailRows) {
      const vId = Number(row.material_variant_id)
      const lv2Id = lv2ByVariantId.get(vId)
      if (!lv2Id) continue

      if (!savedVariantDetails.has(lv2Id)) {
        savedVariantDetails.set(lv2Id, [])
      }
      savedVariantDetails.get(lv2Id)!.push({
        lv3_id: Number(row.material_id),
        name: row.name as string,
        test_qty: row.test_qty as number | null,
        unit_id: row.unit_id as number | null,
      })
    }
  }

  // ── Step 3: Delete in FK order ────────────────────────────────────────────
  // 3a. ws_bmhp_examination_target_materials via bmhp_materials
  if (bmhpMaterialIds.length > 0) {
    const etmRows: any[] = await db
      .selectFrom("ws_bmhp_examination_target_materials")
      .select("id")
      .where("bmhp_material_id", "in", bmhpMaterialIds)
      .execute()
    if (etmRows.length > 0) {
      await batchDeleteById(
        db,
        "ws_bmhp_examination_target_materials",
        etmRows.map((r) => Number(r.id))
      )
    }
  }

  // 3b. ws_bmhp_materials_unit_details via ws_bmhp_material_details (skip if table doesn't exist)
  if (materialDetailIds.length > 0) {
    try {
      const udRows: any[] = await db
        .selectFrom("ws_bmhp_materials_unit_details" as any)
        .select("id")
        .where("material_detail_id", "in", materialDetailIds)
        .execute()
      if (udRows.length > 0) {
        await batchDeleteById(
          db,
          "ws_bmhp_materials_unit_details",
          udRows.map((r) => Number(r.id))
        )
      }
    } catch {
      // Table ws_bmhp_materials_unit_details might not exist yet
    }
  }

  // 3c. ws_bmhp_material_variant_detail via ws_bmhp_material_variant
  if (variantIds.length > 0) {
    const vdRows: any[] = await db
      .selectFrom("ws_bmhp_material_variant_detail")
      .select("id")
      .where("material_variant_id", "in", variantIds)
      .execute()
    if (vdRows.length > 0) {
      await batchDeleteById(
        db,
        "ws_bmhp_material_variant_detail",
        vdRows.map((r) => Number(r.id))
      )
    }
  }

  // 3d. ws_bmhp_material_details via bmhp_material_id
  if (bmhpMaterialIds.length > 0) {
    for (let i = 0; i < bmhpMaterialIds.length; i += BATCH) {
      await db
        .deleteFrom("ws_bmhp_material_details")
        .where("bmhp_material_id", "in", bmhpMaterialIds.slice(i, i + BATCH))
        .execute()
    }
  }

  // 3e. ws_bmhp_material_variant
  if (variantIds.length > 0) {
    await batchDeleteById(db, "ws_bmhp_material_variant", variantIds)
  }

  // 3f. bmhp_materials
  if (bmhpMaterialIds.length > 0) {
    await batchDeleteById(db, "bmhp_materials", bmhpMaterialIds)
  }

  // ── Step 4: Re-insert bmhp_materials ──────────────────────────────────────
  const toInsertMaterials: Array<{
    name: string
    is_reagen: number
    description: null
    program_plan_id: number
  }> = []
  for (const planId of programPlanIds) {
    for (const row of BMHP_MATERIAL_ROWS) {
      toInsertMaterials.push({
        ...row,
        description: null,
        program_plan_id: planId,
      })
    }
  }
  for (let i = 0; i < toInsertMaterials.length; i += BATCH) {
    await db
      .insertInto("bmhp_materials")
      .values(toInsertMaterials.slice(i, i + BATCH))
      .execute()
  }

  // ── Step 5: Build merksShouldBeVariant Set ────────────────────────────────
  const freshBmhpRows: any[] = await db
    .selectFrom("bmhp_materials")
    .select(["id", "name", "is_reagen"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()

  const variantBmhpNames = new Set<string>()
  const reagenBmhpNames = new Set<string>()
  for (const row of freshBmhpRows) {
    const nameLower = (row.name as string).toLowerCase().trim()
    variantBmhpNames.add(nameLower)
    const isReagen = Number(row.is_reagen) === 1
    if (isReagen || nameLower.includes("paper")) {
      reagenBmhpNames.add(nameLower)
    }
  }

  const merksShouldBeVariant = new Set<string>()
  const merkIsReagenMap = new Map<string, boolean>()
  for (const pair of BMHP_MERK_PAIRS) {
    const bmhpKey = pair.bmhp.toLowerCase().trim()
    const merkKey = pair.merk.toLowerCase().trim()
    merksShouldBeVariant.add(merkKey)
    if (reagenBmhpNames.has(bmhpKey)) {
      merkIsReagenMap.set(merkKey, true)
    }
  }

  // ── Step 6: Re-insert ws_bmhp_material_variant ────────────────────────────
  const materialRows: any[] = await db
    .selectFrom("materials")
    .select(["id", "name"])
    .where("material_level_id", "=", 2)
    .where("deleted_at", "is", null)
    .execute()
  const materialIdByName = new Map<string, number>(
    materialRows.map((r) => [r.name.toLowerCase().trim(), Number(r.id)])
  )

  const newVariantIdByMaterialAndPlan = new Map<string, number>()
  const toInsertVariants: Array<{
    material_id: number
    is_variant: number
    program_plan_id: number
  }> = []
  const variantInsertSet = new Set<string>()

  for (const planId of programPlanIds) {
    for (const m of ALL_MERKS) {
      const materialId = materialIdByName.get(m.name.toLowerCase().trim())
      if (!materialId) continue

      const dedupKey = `${materialId}__${planId}`
      if (variantInsertSet.has(dedupKey)) continue
      variantInsertSet.add(dedupKey)

      const isReagenOrPaper =
        merkIsReagenMap.get(m.name.toLowerCase().trim()) ?? false
      const isVariant = isReagenOrPaper ? 0 : 1
      toInsertVariants.push({
        material_id: materialId,
        is_variant: isVariant,
        program_plan_id: planId,
      })
    }
  }

  // Insert and track new IDs
  for (let i = 0; i < toInsertVariants.length; i += BATCH) {
    const batch = toInsertVariants.slice(i, i + BATCH)
    const results = await db
      .insertInto("ws_bmhp_material_variant")
      .values(batch)
      .execute()
    // Get inserted IDs - use lastInsertId for sequential batch
  }

  // Re-fetch new variant IDs
  const newVariantRows: any[] = await db
    .selectFrom("ws_bmhp_material_variant")
    .select(["id", "material_id", "program_plan_id", "is_variant"])
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  for (const r of newVariantRows) {
    newVariantIdByMaterialAndPlan.set(
      `${r.material_id}__${r.program_plan_id}`,
      Number(r.id)
    )
  }

  const variantIsVariantMap = new Map<number, number>()
  for (const r of newVariantRows) {
    variantIsVariantMap.set(Number(r.id), Number(r.is_variant))
  }

  // ── Step 7: Re-insert ws_bmhp_material_variant_detail ─────────────────────
  const vdToInsert: Array<{
    material_variant_id: number
    material_id: number
    name: string
    test_qty: number | null
    unit_id: number | null
  }> = []
  const vdDedupSet = new Set<string>()

  for (const planId of programPlanIds) {
    for (const [lv2Id, details] of savedVariantDetails) {
      const newVariantId = newVariantIdByMaterialAndPlan.get(
        `${lv2Id}__${planId}`
      )
      if (!newVariantId) continue

      const isVariant = variantIsVariantMap.get(newVariantId)
      if (isVariant !== 0) continue

      for (const detail of details) {
        const dedupKey = `${newVariantId}__${detail.lv3_id}`
        if (vdDedupSet.has(dedupKey)) continue
        vdDedupSet.add(dedupKey)

        vdToInsert.push({
          material_variant_id: newVariantId,
          material_id: detail.lv3_id,
          name: detail.name,
          test_qty: detail.test_qty,
          unit_id: detail.unit_id,
        })
      }
    }
  }

  if (vdToInsert.length > 0) {
    for (let i = 0; i < vdToInsert.length; i += BATCH) {
      await db
        .insertInto("ws_bmhp_material_variant_detail")
        .values(vdToInsert.slice(i, i + BATCH))
        .execute()
    }
  }

  // ── Step 8: Re-insert ws_bmhp_material_details ────────────────────────────
  const freshBmhpIdByName = new Map<string, number>()
  for (const r of freshBmhpRows) {
    const key = (r.name as string).toLowerCase().trim()
    if (!freshBmhpIdByName.has(key)) {
      freshBmhpIdByName.set(key, Number(r.id))
    }
  }

  const mdToInsert: Array<{
    bmhp_material_id: number
    material_id: number
    material_level_id: number
    test_qty_per_package: number
  }> = []
  for (const pair of BMHP_MERK_PAIRS) {
    const bmhpId = freshBmhpIdByName.get(pair.bmhp.toLowerCase().trim())
    const matId = materialIdByName.get(pair.merk.toLowerCase().trim())
    if (!bmhpId || !matId) continue
    mdToInsert.push({
      bmhp_material_id: bmhpId,
      material_id: matId,
      material_level_id: 2,
      test_qty_per_package: 0,
    })
  }

  if (mdToInsert.length > 0) {
    for (let i = 0; i < mdToInsert.length; i += BATCH) {
      await db
        .insertInto("ws_bmhp_material_details")
        .values(mdToInsert.slice(i, i + BATCH))
        .execute()
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const programPlanIds = await fetchBMHPPlanIds(db)
  if (programPlanIds.length === 0) return

  // Collect IDs
  const variantRows: any[] = await db
    .selectFrom("ws_bmhp_material_variant")
    .select("id")
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const variantIds = variantRows.map((r) => Number(r.id))

  const bmhpMaterialRows: any[] = await db
    .selectFrom("bmhp_materials")
    .select("id")
    .where("program_plan_id", "in", programPlanIds)
    .where("deleted_at", "is", null)
    .execute()
  const bmhpMaterialIds = bmhpMaterialRows.map((r) => Number(r.id))

  // Delete in FK order
  if (bmhpMaterialIds.length > 0) {
    for (let i = 0; i < bmhpMaterialIds.length; i += BATCH) {
      await db
        .deleteFrom("ws_bmhp_material_details")
        .where("bmhp_material_id", "in", bmhpMaterialIds.slice(i, i + BATCH))
        .execute()
    }
  }

  if (variantIds.length > 0) {
    const vdRows: any[] = await db
      .selectFrom("ws_bmhp_material_variant_detail")
      .select("id")
      .where("material_variant_id", "in", variantIds)
      .execute()
    if (vdRows.length > 0) {
      await batchDeleteById(
        db,
        "ws_bmhp_material_variant_detail",
        vdRows.map((r) => Number(r.id))
      )
    }
  }

  if (variantIds.length > 0) {
    await batchDeleteById(db, "ws_bmhp_material_variant", variantIds)
  }

  if (bmhpMaterialIds.length > 0) {
    await batchDeleteById(db, "bmhp_materials", bmhpMaterialIds)
  }
}
