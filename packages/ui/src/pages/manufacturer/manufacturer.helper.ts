import { TManufacturer } from '#types/manufacturer'
import { TFunction } from 'i18next'

import { listManufacturerType } from './manufacturer.service'

export function generateManufacturerDetail(
  t: TFunction<['common', 'manufacturer']>,
  data?: TManufacturer
) {
  return [
    {
      label: t('manufacturer:column.name'),
      value: data?.name ?? '-',
    },
    {
      label: t('type'),
      value: data?.manufacture_type?.name ?? '-',
    },
    {
      label: t('description'),
      value: data?.description ?? '-',
    },
    {
      label: t('contact_name'),
      value: data?.contact_name ?? '-',
    },
    {
      label: t('phone_number'),
      value: data?.phone_number ?? '-',
    },
    {
      label: 'Email',
      value: data?.email ?? '-',
    },
    {
      label: t('address'),
      value: data?.address ?? '-',
    },
  ]
}

export async function getManufacturerOptions() {
  const result = await listManufacturerType()
  return result?.map((item) => ({
    label: item?.name,
    value: item?.id,
  }))
}
