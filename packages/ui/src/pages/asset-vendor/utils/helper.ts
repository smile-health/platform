import { parseDateTime } from '#utils/date'
import { getFullName } from '#utils/strings'
import { TFunction } from 'i18next'

import {
  CreateAssetVendorBody,
  DetailAssetVendorResponse,
} from '../asset-vendor.type'

export function handleDefaultValue(defaultValue?: CreateAssetVendorBody) {
  return {
    name: defaultValue?.name ?? '',
    description: defaultValue?.description ?? null,
    asset_vendor_type_id: defaultValue?.asset_vendor_type_id ?? null,
  }
}

export function generateDetail(
  t: TFunction<'assetVendor'>,
  detail?: DetailAssetVendorResponse
) {
  return [
    {
      label: t('form.detail.label.name'),
      value: detail?.name ?? '-',
    },
    {
      label: t('form.detail.label.type'),
      value: detail?.asset_vendor_type?.name,
    },
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
          detail?.user_created_by?.firstname,
          detail?.user_created_by?.lastname
        ) ?? '-',
    },
  ]
}
