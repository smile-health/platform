import { TFunction } from 'i18next'

// Generic integration-client passthrough ids — unrelated to the `type`
// ('smile' | 'wms') field now returned on workspaces/programs. Do not use
// these to detect "is this entity/user/program WMS", use
// `program.type === 'wms'` instead.
export const ProgramIntegrationClient = {
  Kesling: Number(process.env.KESLING_PROGRAM_ID),
} as const

export enum ProgramEnum {
  Immunization = 'immunization',
  Logistic = 'logistic',
  Rabies = 'rabies',
  Malaria = 'malaria',
  Hiv = 'hiv',
  Tb = 'tb',
  AntiVenom = 'anti-venom',
  Obat = 'obat',
  Diare = 'diare',
  Filariasis = 'filariasis',
  Gizi = 'gizi',
  Hepatitis = 'hepatitis',
  Keswa = 'keswa',
  KIA = 'kia',
  Kusta = 'kusta',
  WasteManagement = 'waste-management',
  Kesling = 'kesling',
}

export type TProgramPoc = {
  id: number
  key: ProgramEnum
  label: string
  activity_id?: number
  name: string
  bg: string
  color: string
}

export const WORKSPACE: Record<ProgramEnum, TProgramPoc> = {
  'immunization': {
    id: 1,
    key: ProgramEnum.Immunization,
    name: 'Immunization',
    label: 'IM',
    bg: 'ui-bg-[#004990]',
    color: 'ui-text-white',
  },
  'logistic': {
    id: 2,
    key: ProgramEnum.Logistic,
    name: 'Logistic',
    label: 'LO',
    activity_id: 1,
    bg: 'ui-bg-[#680771]',
    color: 'ui-text-white',
  },
  'rabies': {
    id: 2,
    key: ProgramEnum.Rabies,
    name: 'Rabies',
    label: 'RA',
    bg: 'ui-bg-[#E9D5FF]',
    color: 'ui-text-black',
  },
  'malaria': {
    id: 2,
    key: ProgramEnum.Malaria,
    name: 'Malaria',
    label: 'MA',
    bg: 'ui-bg-[#DC2626]',
    color: 'ui-text-white',
  },
  'hiv': {
    id: 2,
    key: ProgramEnum.Hiv,
    name: 'HIV/AIDS',
    label: 'HIV',
    activity_id: 5,
    bg: 'ui-bg-[#DB2777]',
    color: 'ui-text-white',
  },
  'tb': {
    id: 2,
    key: ProgramEnum.Tb,
    name: 'TB',
    label: 'TB',
    activity_id: 4,
    bg: 'ui-bg-[#166534]',
    color: 'ui-text-white',
  },
  'anti-venom': {
    id: 2,
    key: ProgramEnum.AntiVenom,
    name: 'Anti Venom',
    label: 'AN',
    activity_id: 7,
    bg: 'ui-bg-[#334155]',
    color: 'ui-text-white',
  },
  'obat': {
    id: 2,
    key: ProgramEnum.Obat,
    activity_id: 8,
    name: 'Obat',
    label: 'OB',
    bg: 'ui-bg-[#680771]',
    color: 'ui-text-white',
  },
  'diare': {
    id: 2,
    key: ProgramEnum.Diare,
    name: 'Diare',
    label: 'DI',
    bg: 'ui-bg-[#FED7AA]',
    color: 'ui-text-black',
  },
  'filariasis': {
    id: 2,
    key: ProgramEnum.Filariasis,
    name: 'Filariasis',
    label: 'FI',
    bg: 'ui-bg-[#6EE7B7]',
    color: 'ui-text-black',
  },
  'gizi': {
    id: 2,
    key: ProgramEnum.Gizi,
    name: 'Gizi',
    label: 'GI',
    bg: 'ui-bg-[#D9F99D]',
    color: 'ui-text-black',
  },
  'hepatitis': {
    id: 2,
    key: ProgramEnum.Hepatitis,
    name: 'Hepatitis',
    label: 'HE',
    bg: 'ui-bg-[#06B6D4]',
    color: 'ui-text-white',
  },
  'keswa': {
    id: 2,
    key: ProgramEnum.Keswa,
    name: 'Keswa',
    label: 'KE',
    bg: 'ui-bg-[#F97316]',
    color: 'ui-text-white',
  },
  'kia': {
    id: 2,
    key: ProgramEnum.KIA,
    name: 'KIA',
    label: 'KI',
    bg: 'ui-bg-[#FACC15]',
    color: 'ui-text-white',
  },
  'kusta': {
    id: 2,
    key: ProgramEnum.Kusta,
    name: 'Kusta',
    label: 'KU',
    bg: 'ui-bg-[#BFDBFE]',
    color: 'ui-text-black',
  },
  'waste-management': {
    id: 2,
    key: ProgramEnum.WasteManagement,
    name: 'Waste Management',
    label: 'WM',
    bg: 'ui-bg-[#047856]',
    color: 'ui-text-white',
  },
  'kesling': {
    id: 2,
    key: ProgramEnum.Kesling,
    name: 'Kesling',
    label: 'KS',
    bg: 'ui-bg-[#84CC16]',
    color: 'ui-text-white',
  },
}

export const programPocList = [
  WORKSPACE.immunization,
  WORKSPACE.rabies,
  WORKSPACE.malaria,
  WORKSPACE.hiv,
  WORKSPACE.tb,
  WORKSPACE['anti-venom'],
  WORKSPACE.obat,
  WORKSPACE.diare,
  WORKSPACE.filariasis,
  WORKSPACE.gizi,
  WORKSPACE.hepatitis,
  WORKSPACE.keswa,
  WORKSPACE.kia,
  WORKSPACE.kusta,
  WORKSPACE.kesling,
]

export const noProgram = (t: TFunction) => ({
  label: t('form.program.no_program'),
  value: 0,
})

export const IconPrograms: Record<string, string> = {
  'logistic': '/images/icon-programs/SMILE_OBAT_ESENSIAL_NASIONAL.png',
  'malaria': '/images/icon-programs/SMILE_MALARIA.png',
  'tb': '/images/icon-programs/SMILE_TUBERKOLOSIS.png',
  'hiv': '/images/icon-programs/SMILE_HIV.png',
  'diare': '/images/icon-programs/SMILE_DIARE.png',
  'kusta': '/images/icon-programs/SMILE_KUSTA.png',
  'frambusia': '/images/icon-programs/SMILE_FRAMBUSIA.png',
  'filariasis': '/images/icon-programs/SMILE_FILARIASIS.png',
  'kia': '/images/icon-programs/SMILE_KIA.png',
  'keswa': '/images/icon-programs/SMILE_KESWA.png',
  'hepatitis': '/images/icon-programs/SMILE_HEPATITIS.png',
  'waste-management': '/images/icon-programs/SMILE_WMS.png',
  'kesling': '/images/icon-programs/SMILE_KESLING.png',
  'kesga': '/images/icon-programs/SMILE_KIA.png',
  'rabies': '/images/icon-programs/SMILE_RABIES.png',
  'immunization': '/images/icon-programs/SMILE_IMUNISASI.png',
  'wms': '/images/icon-programs/SMILE_WMS.png',
}
