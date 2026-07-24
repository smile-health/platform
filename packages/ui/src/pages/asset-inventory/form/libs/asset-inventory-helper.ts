import { parseDate } from '@internationalized/date'
import { USER_ROLE } from '#constants/roles'
import { GetProfileResponse } from '#services/profile'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { OWNERSHIP_STATUS } from '../../detail/libs/asset-inventory-detail.constant'
import { ASSET_TYPE } from '../../list/libs/asset-inventory-list.constants'
import { TAssetInventory } from '../../list/libs/asset-inventory-list.types'

const getAssetTypeValue = (
  isEditPage: boolean,
  data: TAssetInventory | null | undefined,
  t: TFunction<['common', 'assetInventory']>
) => {
  if (!isEditPage) return null

  if (!data?.other_asset_type_name) {
    return {
      value: data?.asset_type?.id,
      label: data?.asset_type?.name,
      is_ownership_type: [
        ASSET_TYPE.VACCINE_CARRIER,
        ASSET_TYPE.FREEZE_INDICATOR,
      ].includes(Number(data?.asset_type?.id)),
      ...data?.asset_type,
    }
  }

  return { label: t('assetInventory:add_another_option'), value: 'other' }
}

const getManufactureValue = (
  isEditPage: boolean,
  data: TAssetInventory | null | undefined,
  t: TFunction<['common', 'assetInventory']>
) => {
  if (!isEditPage) return null

  if (!data?.other_manufacture_name) {
    return {
      value: data?.manufacture?.id,
      label: data?.manufacture?.name,
    }
  }

  return { label: t('assetInventory:add_another_option'), value: 'other' }
}

const getAssetModelValue = (
  isEditPage: boolean,
  data: TAssetInventory | null | undefined,
  t: TFunction<['common', 'assetInventory']>
) => {
  if (!isEditPage) return null

  if (!data?.other_asset_model_name) {
    return {
      value: data?.asset_model?.id,
      label: data?.asset_model?.name,
      ...data?.asset_model,
    }
  }

  return { label: t('assetInventory:add_another_option'), value: 'other' }
}

const getBudgetSourceValue = (
  isEditPage: boolean,
  data: TAssetInventory | null | undefined,
  t: TFunction<['common', 'assetInventory']>
) => {
  if (!isEditPage) return null

  if (data?.budget_source?.id) {
    return {
      value: data?.budget_source?.id,
      label: data?.budget_source?.name,
    }
  }

  return { label: t('assetInventory:add_another_option'), value: 'other' }
}

const getBorrowedFromValue = (
  data: TAssetInventory | null | undefined,
  t: TFunction<['common', 'assetInventory']>
) => {
  if (data?.ownership?.id !== OWNERSHIP_STATUS?.BORROWED) return null

  if (data?.borrowed_from?.id) {
    return {
      value: data?.borrowed_from?.id,
      label: data?.borrowed_from?.name,
    }
  }

  return { label: t('assetInventory:add_another_option'), value: 'other' }
}

const getEntityValue = (
  data: TAssetInventory | null | undefined,
  profile?: GetProfileResponse | null,
  isEditPage?: boolean
) => {
  if (profile?.role === USER_ROLE.MANAGER && !isEditPage) {
    return {
      value: profile?.entity?.id,
      label: profile?.entity?.name,
    }
  }
  if (data?.entity) {
    return {
      value: data?.entity?.id,
      label: data?.entity?.name,
    }
  }

  return null
}

export const handleDefaultValues = (
  isEditPage: boolean,
  t: TFunction<['common', 'assetInventory']>,
  data?: TAssetInventory | null,
  profile?: GetProfileResponse | null
) => ({
  asset_type: getAssetTypeValue(isEditPage, data, t),
  manufacture: getManufactureValue(isEditPage, data, t),
  asset_model: getAssetModelValue(isEditPage, data, t),
  serial_number: data?.serial_number ?? null,
  production_year: data?.production_year
    ? {
        value: data?.production_year,
        label: data?.production_year,
      }
    : null,
  entity: getEntityValue(data, profile, isEditPage),
  ownership_status: data?.ownership ? Number(data?.ownership?.id) : '1',
  maintainers: data?.maintenance
    ? {
        value: data?.maintenance?.asset_vendor_id,
        label: data?.maintenance?.asset_vendor_name,
      }
    : { label: t('assetInventory:add_another_option'), value: 'other' },
  electricity: data?.electricity?.id
    ? {
        value: data?.electricity?.id,
        label: data?.electricity?.name,
      }
    : null,
  warranty_start_date: data?.warranty?.start_date
    ? parseDate(dayjs(data?.warranty.start_date).format('YYYY-MM-DD'))
    : null,
  warranty_end_date: data?.warranty?.end_date
    ? parseDate(dayjs(data?.warranty.end_date).format('YYYY-MM-DD'))
    : null,
  warranty_vendor: data?.warranty?.asset_vendor_id
    ? {
        value: data?.warranty?.asset_vendor_id,
        label: data?.warranty?.asset_vendor_name,
      }
    : null,
  calibration_last_date: data?.calibration?.last_date
    ? parseDate(dayjs(data?.calibration?.last_date).format('YYYY-MM-DD'))
    : null,
  calibration_vendor: data?.calibration?.asset_vendor_id
    ? {
        value: data?.calibration?.asset_vendor_id,
        label: data?.calibration?.asset_vendor_name,
      }
    : null,
  calibration_schedule: data?.calibration?.schedule_id
    ? {
        value: data?.calibration?.schedule_id,
        label: data?.calibration?.name,
      }
    : null,
  maintenance_last_date: data?.maintenance?.last_date
    ? parseDate(dayjs(data?.maintenance?.last_date).format('YYYY-MM-DD'))
    : null,
  maintenance_vendor: data?.maintenance?.asset_vendor_id
    ? {
        value: data?.maintenance?.asset_vendor_id,
        label: data?.maintenance?.asset_vendor_name,
      }
    : null,
  maintenance_schedule: data?.maintenance?.schedule_id
    ? {
        value: data?.maintenance?.schedule_id,
        label: data?.maintenance?.name,
      }
    : null,
  budget_year: data?.budget_source
    ? {
        value: data?.budget_source?.year,
        label: data?.budget_source?.year,
      }
    : null,
  budget_source: getBudgetSourceValue(isEditPage, data, t),
  asset_status: data?.working_status
    ? {
        value: data?.working_status?.id,
        label: data?.working_status?.name,
      }
    : null,
  created_by: `${data?.user_created_by?.firstname ?? ''} ${data?.user_created_by?.lastname ?? ''}`,
  updated_by: data?.updated_at ?? null,
  borrowed_from: getBorrowedFromValue(data, t),
  max_temp: data?.asset_type?.min_temperature,
  min_temp: data?.asset_type?.max_temperature,
  gross_capacity: data?.asset_model?.gross_capacity ?? null,
  nett_capacity: data?.asset_model?.net_capacity ?? null,
  other_asset_model_name: data?.other_asset_model_name ?? null,
  other_asset_type_name: data?.other_asset_type_name ?? null,
  other_budget_source_name: data?.other_budget_source_name ?? null,
  other_manufacture_name: data?.other_manufacture_name ?? null,
  other_max_temperature: data?.other_max_temperature ?? undefined,
  other_min_temperature: data?.other_min_temperature ?? undefined,
  other_gross_capacity: data?.other_gross_capacity ?? undefined,
  other_net_capacity: data?.other_net_capacity ?? undefined,
  contact_person_user_1_name: data?.contact_persons?.[0]?.name ?? null,
  contact_person_user_1_number: data?.contact_persons?.[0]?.phone ?? null,
  contact_person_user_2_name: data?.contact_persons?.[1]?.name ?? null,
  contact_person_user_2_number: data?.contact_persons?.[1]?.phone ?? null,
  contact_person_user_3_name: data?.contact_persons?.[2]?.name ?? null,
  contact_person_user_3_number: data?.contact_persons?.[2]?.phone ?? null,
  ownership_qty: data?.ownership?.qty ?? null,
  other_borrowed_from_entity_name:
    data?.other_borrowed_from_entity_name ?? null,
  program_ids:
    data?.programs?.map((program) => ({
      value: program.id,
      label: program.name,
    })) ?? null,
})
