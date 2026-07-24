import { parseDateTime } from '#utils/date'
import { getFullName } from '#utils/strings'
import { TFunction } from 'i18next'

import {
  CreateAssetTypeBody,
  DetailAssetTypeResponse,
} from '../asset-type.type'

export function handleDefaultValue(defaultValue?: CreateAssetTypeBody) {
  return {
    name: defaultValue?.name ?? '',
    description: defaultValue?.description ?? null,
    temperature_thresholds: defaultValue?.temperature_thresholds ?? [],
    humidity_thresholds: defaultValue?.humidity_thresholds ?? [],
    is_cce: defaultValue?.is_cce ?? 0,
    is_cce_warehouse: defaultValue?.is_cce_warehouse ?? 0,
    is_warehouse: defaultValue?.is_warehouse ?? 0,
    is_temperature_adjustable: defaultValue?.is_temperature_adjustable ?? 0,
  }
}

export function generateDetail(
  t: TFunction<'assetType'>,
  detail?: DetailAssetTypeResponse
) {
  return [
    { label: t('form.detail.label.name'), value: detail?.name ?? '-' },
    {
      label: t('form.detail.label.description'),
      value: detail?.description ?? '-',
    },
    {
      label: t('form.detail.label.last_updated_at'),
      value:
        parseDateTime(detail?.updated_at, 'DD MMM YYYY HH:mm').toUpperCase() ??
        '-',
    },
    {
      label: t('form.detail.label.last_updated_by'),
      value:
        getFullName(
          detail?.updated_by?.firstname ?? '',
          detail?.updated_by?.lastname ?? ''
        ) ?? '-',
    },
  ]
}
