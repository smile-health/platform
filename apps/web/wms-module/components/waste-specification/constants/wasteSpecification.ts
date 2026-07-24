export const wasteBagColorValues = [
  { value: 'BLACK' },
  { value: 'GRAY' },
  { value: 'PURPLE' },
  { value: 'BROWN' },
  { value: 'RED' },
  { value: 'YELLOW' },
  { value: 'NONE' },
] as const;

export const internalTreatmentValues = [
  { value: 'PYROLYSIS' },
  { value: 'DISINFECTION' },
  { value: 'INTERNAL_LANDFILL' },
] as const;

export const externalTreatmentValues = [
  { value: 'TRANSPORTER_TREATMENT' },
  { value: 'TRANSPORTER_LANDFILL' },
  { value: 'TRANSPORTER_RECYCLER' },
  { value: 'SPECIALIZED_TREATMENT_PROVIDER' },
  { value: 'TRANSPORTER_GOVERNMENT' },
  { value: 'TRANSPORTER_GOVERNMENT_WASTE_BANK' },
] as const;

export const vehicleTypesValues = [
  { value: 'BOX_TRUCK' },
  { value: 'REFRIGERATED_BOX_TRUCK' },
  { value: 'OPEN_BODY_TRUCK' },
  { value: 'TANKER' },
  { value: 'HAZARDOUS_MATERIAL_TRUCK' },
  { value: 'RADIOACTIVE_MATERIAL_TRUCK' },
  { value: 'FLATBED_TRUCK' },
  { value: 'LOADER_TRUCK' },
  { value: 'TRAILER' },
  { value: 'VAN' },
] as const;
