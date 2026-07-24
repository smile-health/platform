import { TFunction } from 'i18next'

export const VACCINE_METHOD = {
  INTRA_MUSCULAR: '1',
  INTRA_DERMAL: '2',
}

export const getMethodList = (t: TFunction<'dashboardRabies'>) => {
  return [
    {
      label: t('label.all'),
      value: '0',
    },
    {
      label: t('label.intra_muscular'),
      value: VACCINE_METHOD.INTRA_MUSCULAR,
    },
    {
      label: 'Intra Dermal',
      value: VACCINE_METHOD.INTRA_DERMAL,
    },
  ]
}

export const getGenderList = (t: TFunction<'dashboardRabies'>) => {
  return [
    {
      label: t('label.all'),
      value: '0',
    },
    {
      label: t('label.male'),
      value: '1',
    },
    {
      label: t('label.female'),
      value: '2',
    },
  ]
}

export const getCareCascadeTabs = (t: TFunction<'dashboardRabies'>) => {
  return [
    {
      key: 'all',
      label: t('label.all'),
      value: '',
    },
    {
      key: 'nik',
      label: t('label.nik'),
      value: '1',
    },
    {
      key: 'non-nik',
      label: t('label.non_nik'),
      value: '2',
    },
  ]
}

export const MONTHLY_PATIENT_DOSE_TABS = (t: TFunction<'dashboardRabies'>) => [
  {
    label: t('tabs.var.label'),
    value: t('tabs.var.value'),
  },
  {
    label: t('tabs.sar.label'),
    value: t('tabs.sar.value'),
  },
]

export const getVaccineCategoryLabel = (
  t: TFunction<'dashboardRabies'>,
  category: string
) => {
  const mappingLabel: Record<string, string> = {
    var: t('label.var'),
    sar: t('label.sar'),
  }
  return mappingLabel[category] ?? category
}

export const VACCINE_SEQUENCE = {
  VAR_I: 1,
  VAR_II: 2,
  VAR_III: 3,
  BOOSTER_I: 4,
  BOOSTER_II: 5,
  PRE_EXPOSURE_I: 6,
  PRE_EXPOSURE_II: 7,
  VAR_IV: 8,
}

export const VACCINE_SEQUENCE_COLORS = [
  '#680771',
  '#D86DCD',
  '#004990',
  '#1BA8DF',
  '#0367FF',
  '#6EB0FF',
  '#FFC002',
  '#FFDF79',
]
