import { OptionType } from '#components/react-select'

import { AssetInventoryFormData } from './asset-inventory-form.type'

const getValueOrUndefined = (
  item: OptionType | null,
  otherValue?: string | number
) => {
  if (!item?.value) return undefined
  return item.value === 'other' ? otherValue : item.value
}

const getNameOrUndefined = (item: OptionType | null, otherName?: string) => {
  if (!item?.value) return undefined
  return item.value === 'other' ? otherName : item.label
}

const getNumericValue = (value: number | null) => {
  return value ? Number(value) : undefined
}

const getBorrowedFromEntity = (borrowedFrom: OptionType | null) => {
  if (!borrowedFrom?.value) return { id: null, name: null }

  return {
    id: Number(borrowedFrom.value),
    name: borrowedFrom.value !== 'other' ? borrowedFrom.label : null,
  }
}

const buildContactPersons = (value: AssetInventoryFormData) => {
  const contacts = [
    {
      name: value?.contact_person_user_1_name ?? undefined,
      phone: value?.contact_person_user_1_number ?? undefined,
    },
  ]

  if (value?.contact_person_user_2_name) {
    contacts.push({
      name: value.contact_person_user_2_name,
      phone: value?.contact_person_user_2_number ?? undefined,
    })
  }

  if (value?.contact_person_user_3_name) {
    contacts.push({
      name: value.contact_person_user_3_name,
      phone: value?.contact_person_user_3_number ?? undefined,
    })
  }

  return contacts
}

export const processingForm = (value: AssetInventoryFormData) => {
  const borrowedFromEntity = getBorrowedFromEntity(value?.borrowed_from)

  const result = {
    asset_type_id: getValueOrUndefined(value?.asset_type),
    asset_type_name:
      value?.asset_type?.value === 'other' ? undefined : value?.asset_type_name,
    entity_id: getNumericValue(value?.entity?.value),
    entity_name: value?.entity?.label ?? undefined,
    serial_number: value?.serial_number ?? undefined,
    production_year: value?.production_year?.value ?? undefined,
    asset_model_id: getValueOrUndefined(value?.asset_model),
    asset_model_name: getNameOrUndefined(value?.asset_model),
    manufacture_id: getValueOrUndefined(value?.manufacture),
    manufacture_name: getNameOrUndefined(value?.manufacture),
    asset_working_status_id: value?.asset_status?.value ?? undefined,
    asset_working_status_name: value?.asset_status?.label ?? undefined,
    budget_year: value?.budget_year?.value ?? undefined,
    budget_source_id: getValueOrUndefined(value?.budget_source),
    budget_source_name: getNameOrUndefined(value?.budget_source),
    borrowed_from_entity_id: borrowedFromEntity.id,
    borrowed_from_entity_name: borrowedFromEntity.name,
    ownership_status: getNumericValue(value?.ownership_status),
    ownership_qty: getNumericValue(value?.ownership_qty),
    asset_electricity_id: value?.electricity?.value ?? undefined,
    contact_persons: buildContactPersons(value),
    warranty_asset_vendor_id: value?.warranty_vendor?.value ?? undefined,
    warranty_asset_vendor_name: value?.warranty_vendor?.label ?? undefined,
    warranty_end_date: value?.warranty_end_date?.toString() ?? undefined,
    warranty_start_date: value?.warranty_start_date?.toString() ?? undefined,
    calibration_asset_vendor_id: value?.calibration_vendor?.value ?? undefined,
    calibration_asset_vendor_name:
      value?.calibration_vendor?.label ?? undefined,
    calibration_last_date:
      value?.calibration_last_date?.toString() ?? undefined,
    calibration_schedule_id: value?.calibration_schedule?.value ?? undefined,
    calibration_schedule_name: value?.calibration_schedule?.label ?? undefined,
    maintenance_asset_vendor_id: value?.maintenance_vendor?.value ?? undefined,
    maintenance_asset_vendor_name:
      value?.maintenance_vendor?.label ?? undefined,
    maintenance_last_date:
      value?.maintenance_last_date?.toString() ?? undefined,
    maintenance_schedule_id: value?.maintenance_schedule?.value ?? undefined,
    maintenance_schedule_name: value?.maintenance_schedule?.label ?? undefined,
    other_asset_model_name:
      value?.asset_model?.value === 'other'
        ? value?.other_asset_model_name
        : undefined,
    other_asset_type_name:
      value?.asset_type?.value === 'other'
        ? value?.other_asset_type_name
        : undefined,
    other_budget_source_name:
      value?.budget_source?.value === 'other'
        ? value?.other_budget_source_name
        : undefined,
    other_manufacture_name:
      value?.manufacture?.value === 'other'
        ? value?.other_manufacture_name
        : undefined,
    other_gross_capacity:
      value?.asset_model?.value === 'other'
        ? getNumericValue(value?.other_gross_capacity)
        : undefined,
    other_net_capacity:
      value?.asset_model?.value === 'other'
        ? getNumericValue(value?.other_net_capacity)
        : undefined,
    other_max_temperature:
      value?.asset_type?.value === 'other'
        ? getNumericValue(value?.other_max_temperature)
        : undefined,
    other_min_temperature:
      value?.asset_type?.value === 'other'
        ? getNumericValue(value?.other_min_temperature)
        : undefined,
    other_borrowed_from_entity_name:
      value?.borrowed_from?.value === 'other'
        ? value?.other_borrowed_from_entity_name
        : undefined,
    program_ids: value?.program_ids?.map((item) => item.value) ?? undefined,
  }
  return result
}

export const generatedYearOptions = (): Array<OptionType> => {
  const currentYear = new Date().getFullYear()
  const startYear = 1990
  const options = []
  for (let i = currentYear; i >= startYear; i--) {
    options.push({ value: i, label: i.toString() })
  }
  return options
}
