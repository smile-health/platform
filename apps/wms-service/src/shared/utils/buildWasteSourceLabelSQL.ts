export function buildWasteSourceLabelSQL(language: 'in' | 'en' = 'in') {
  const sourceTypeMap = {
    en: {
      INTERNAL: 'Internal',
      EXTERNAL: 'External',
      INTERNAL_TREATMENT: 'Internal Treatment',
    },
    in: {
      INTERNAL: 'Internal',
      EXTERNAL: 'Eksternal',
      INTERNAL_TREATMENT: 'Pengolahan Internal',
    },
  };

  const wasteSourceTreatmentMap = {
    en: {
      PYROLYSIS: 'Incineration/Pyrolysis',
      DISINFECTION: 'Sterilization/Disinfection',
    },
    in: {
      PYROLYSIS: 'Insinerasi/Pirolisis',
      DISINFECTION: 'Sterilisasi/Desinfeksi',
    },
  };

  const src = sourceTypeMap[language];
  const treat = wasteSourceTreatmentMap[language];

  const caseWasteSourceName = `
    CASE
      WHEN ws.source_type = 'INTERNAL' THEN ws.internal_source_name
      WHEN ws.source_type = 'EXTERNAL' THEN ws.external_healthcare_facility_name
      WHEN ws.source_type = 'INTERNAL_TREATMENT' THEN
        CASE ws.internal_treatment_name
          WHEN 'PYROLYSIS' THEN '${treat.PYROLYSIS}'
          WHEN 'DISINFECTION' THEN '${treat.DISINFECTION}'
          ELSE ws.internal_treatment_name
        END
      ELSE ws.internal_source_name
    END AS wasteSourceName
  `;

  const caseSourceType = `
    CASE ws.source_type
      WHEN 'INTERNAL' THEN '${src.INTERNAL}'
      WHEN 'EXTERNAL' THEN '${src.EXTERNAL}'
      WHEN 'INTERNAL_TREATMENT' THEN '${src.INTERNAL_TREATMENT}'
      ELSE ws.source_type
    END AS sourceType
  `;

  return { caseWasteSourceName, caseSourceType };
}
