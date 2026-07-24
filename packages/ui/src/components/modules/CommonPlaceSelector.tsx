'use client'

import { ReactSelectAsync, ReactSelectProps } from '#components/react-select'
import {
  loadProvinces,
  loadRegencies,
  loadSubdistricts,
  loadVillages,
} from '#services/location'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

type Level = 'province' | 'regency' | 'subdistrict' | 'village'

type CommonPlaceSelectorProps = ReactSelectProps & {
  level: Level
  additional?: {
    page?: number
    parent_id?: string | number
  }
}

const loadOptions = {
  province: loadProvinces,
  regency: loadRegencies,
  subdistrict: loadSubdistricts,
  village: loadVillages,
}

const defaultPlaceholder = (t: TFunction<'common'>, level: Level) => {
  const obj = {
    province: t('form.province.placeholder'),
    regency: t('form.city.placeholder'),
    subdistrict: t('form.subdistrict.placeholder'),
    village: t('form.village.placeholder'),
  }

  return obj[level]
}

export function CommonPlaceSelector({
  additional,
  placeholder,
  level,
  ...props
}: CommonPlaceSelectorProps) {
  const { t } = useTranslation()
  const isProvince = level === 'province'

  return (
    <ReactSelectAsync
      {...props}
      key={isProvince ? 'province' : `level-${additional?.parent_id}`}
      loadOptions={loadOptions[level]}
      debounceTimeout={300}
      placeholder={placeholder || defaultPlaceholder(t, level)}
      additional={{
        page: 1,
        ...additional,
      }}
    />
  )
}
