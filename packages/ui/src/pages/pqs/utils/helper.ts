import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { getFullName } from '#utils/strings'
import { TFunction } from 'i18next'

import { CreatePQSFormInput, PQSDetail } from '../pqs.types'

export function handleDefaultValue(defaultValue?: CreatePQSFormInput) {
  return {
    code: defaultValue?.code ?? undefined,
    pqs_type_id: defaultValue?.pqs_type_id ?? null,
    cceigat_description_id: defaultValue?.cceigat_description_id ?? null,
    net_capacity5: defaultValue?.net_capacity5 ?? undefined,
    net_capacityMin20: defaultValue?.net_capacityMin20 ?? undefined,
    net_capacityMin86: defaultValue?.net_capacityMin86 ?? undefined,
  }
}

export function generateDetail(t: TFunction<'pqs'>, detail?: PQSDetail) {
  return [
    {
      label: t('pqs:detail.section.detail.label.pqs_code'),
      value: detail?.pqs_code ?? '-',
    },
    {
      label: t('pqs:detail.section.detail.label.pqs_type'),
      value: detail?.pqs_type?.name ?? '-',
    },
    {
      label: t('detail.section.detail.label.cceigat_desc'),
      value: detail?.cceigat_description?.name ?? '-',
    },
    {
      label: t('pqs:detail.section.detail.label.last_updated_at'),
      value:
        parseDateTime(detail?.updated_at, 'DD MMM YYYY HH:mm').toUpperCase() ??
        '-',
    },
    {
      label: t('pqs:detail.section.detail.label.last_updated_by'),
      value:
        getFullName(
          detail?.user_updated_by?.firstname,
          detail?.user_updated_by?.lastname
        ) ?? '-',
    },
  ]
}

export function generateDetailCapacity(
  t: TFunction<'pqs'>,
  language: string,
  detail?: PQSDetail
) {
  return [
    {
      label: '+5 °C',
      value: detail?.capacities?.[0]?.capacities5
        ? t('detail.section.capacity.column.litre', {
            value: numberFormatter(
              detail?.capacities?.[0]?.capacities5,
              language,
              'decimal'
            ),
          })
        : null,
    },
    {
      label: '+20 °C',
      value: detail?.capacities?.[1]?.capacitiesMin20
        ? t('detail.section.capacity.column.litre', {
            value: numberFormatter(
              detail?.capacities?.[1]?.capacitiesMin20,
              language,
              'decimal'
            ),
          })
        : null,
    },
    {
      label: '+86 °C',
      value: detail?.capacities?.[2]?.capacitiesMin86
        ? t('detail.section.capacity.column.litre', {
            value: numberFormatter(
              detail?.capacities?.[2]?.capacitiesMin86,
              language,
              'decimal'
            ),
          })
        : null,
    },
  ]
}
