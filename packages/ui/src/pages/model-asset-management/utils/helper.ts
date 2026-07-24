import { parseDateTime } from '#utils/date'
import { getFullName } from '#utils/strings'
import { TFunction } from 'i18next'

import {
  CreateModelAssetBody,
  DetailModelAssetResponse,
} from '../asset-model.type'

export const handleLabel = (
  t: TFunction<'modelAsset'>,
  label: string,
  type: 'gross' | 'net'
) => {
  if (!label) {
    return
  }
  return `${t(
    type === 'gross'
      ? 'form.detail.label.gross_capacity'
      : 'form.detail.label.netto_capacity'
  )} ${label
    .replace('capacities', '')
    .replace('Min', '-')
    .replace('5', '+5')} °C`
}

export const handleAssetUtilizationId = (
  isWarehouse?: number,
  isCce?: number
) => {
  if (isWarehouse === 0 && isCce === 0) {
    return {
      value: 'other',
      label: 'form.detail.label.asset_utilization.is_other',
    }
  }
  if (isWarehouse === 1) {
    return {
      value: 'warehouse',
      label: 'form.detail.label.asset_utilization.is_warehouse',
    }
  }
  if (isCce === 1) {
    return {
      value: 'cce',
      label: 'form.detail.label.asset_utilization.is_cce',
    }
  }
  return undefined
}

export function handleDefaultValue(defaultValue?: CreateModelAssetBody) {
  return {
    name: defaultValue?.name ?? '',
    asset_type_id: defaultValue?.asset_type_id ?? undefined,
    manufacture_id: defaultValue?.manufacture_id ?? undefined,
    is_capacity: defaultValue?.is_capacity ?? 0,
    asset_model_capacity: {
      pqs_code_id: defaultValue?.asset_model_capacity?.pqs_code_id
        ? {
            label: defaultValue?.asset_model_capacity?.pqs_code_id?.label,
            value: Number(
              defaultValue?.asset_model_capacity?.pqs_code_id?.value
            ),
          }
        : null,
      capacities: defaultValue?.asset_model_capacity?.capacities ?? [],
    },
    asset_utilization: defaultValue?.asset_utilization
      ? {
          is_warehouse:
            defaultValue?.asset_utilization?.is_warehouse ?? undefined,
          is_cce: defaultValue?.asset_utilization?.is_cce ?? undefined,
          id: defaultValue?.asset_utilization?.id ?? undefined,
        }
      : undefined,
  }
}

export function generateDetail(
  t: TFunction<'modelAsset'>,
  detail?: DetailModelAssetResponse
) {
  return [
    {
      label: t('form.detail.label.name'),
      value: detail?.asset_model_name ?? '-',
    },
    {
      label: t('form.detail.label.asset_utilization.label'),
      value:
        t(
          handleAssetUtilizationId(detail?.is_warehouse, detail?.is_cce)
            ?.label as unknown as any
        ) ?? '-',
    },
    {
      label: t('form.detail.label.type'),
      value: detail?.asset_type_name ?? '-',
    },
    {
      label: t('form.detail.label.manufacturer'),
      value: detail?.manufacture_name ?? '-',
    },
    {
      label: t('form.detail.label.last_updated_at'),
      value:
        parseDateTime(
          detail?.updated_at ?? '',
          'DD MMM YYYY HH:mm'
        ).toUpperCase() ?? '-',
    },
    {
      label: t('form.detail.label.last_updated_by'),
      value:
        getFullName(
          detail?.updated_by?.firstname,
          detail?.updated_by?.lastname
        ) ?? '-',
    },
  ]
}
