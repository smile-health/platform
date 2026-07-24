import { TFunction } from 'i18next'

export const DEFAULT_DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf']

export enum EntityTag {
  Diskes_Province = 5,
  Dinkes_City = 7,
  Puskesmas = 9,
  Hospital = 11,
}

export const defaultEntityTags = (t: TFunction<'dashboard'>) => [
  {
    value: EntityTag.Diskes_Province,
    label: t('data.entity_tag.province'),
  },
  {
    value: EntityTag.Dinkes_City,
    label: t('data.entity_tag.regency'),
  },
  {
    value: EntityTag.Puskesmas,
    label: t('data.entity_tag.primary_health_care'),
  },
  {
    value: EntityTag.Hospital,
    label: t('data.entity_tag.hospital'),
  },
]

export const yearList = (year?: number) => {
  const currentYear = year ?? new Date().getFullYear()

  return Array.from({ length: currentYear - 2019 }, (_, i) => {
    const year = currentYear - i
    return {
      label: year.toString(),
      value: year,
    }
  })
}

enum IMMUNIZATION_ACTIVITIES {
  ROUTINE = 26,
}

export const getDefaultImmunizationActivities = (t: TFunction<'dashboard'>) => [
  {
    label: t('data.activity.routine'),
    value: IMMUNIZATION_ACTIVITIES.ROUTINE,
  },
]
