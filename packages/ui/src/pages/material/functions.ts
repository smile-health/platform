import { MaterialData } from '#services/material'

export function handleDefaultValue(data?: MaterialData) {
  return {
    name: data?.name || '',
    description: data?.description || '',
    code: data?.code || '',
    unit: data?.unit || '',
    unit_of_distribution: data?.unit_of_distribution || '',
    material_activities: data?.material_activities?.map((item) => {
      return {
        value: item?.id,
        label: item?.name,
      }
    }),
    manufactures: data?.manufactures?.map((item) => {
      return {
        value: item?.id,
        label: item?.name,
      }
    }),
    pieces_per_unit: data?.pieces_per_unit || 0,
    temperature_sensitive: Boolean(data?.temperature_sensitive),
    temperature_min: data?.temperature_min || 0,
    temperature_max: data?.temperature_max || 0,
    managed_in_batch: Boolean(data?.managed_in_batch),
    material_companion: data?.material_companion?.map((item) => {
      return {
        value: item?.id,
        label: item?.name,
      }
    }),
    is_vaccine: data?.is_vaccine ? String(data?.is_vaccine) : '0',
    need_sequence: data?.need_sequence ? String(data?.need_sequence) : '0',
    is_stockcount: data?.is_stockcount ? String(data?.is_stockcount) : '0',
    is_addremove: data?.is_addremove ? String(data?.is_addremove) : '1',
    stockcount: {
      entity_types: data?.stockcount?.entity_types ?? [],
      roles: data?.stockcount?.roles ?? [],
    },
    addremove: {
      entity_types: data?.addremove?.entity_types ?? [],
      roles: data?.addremove?.roles ?? [],
    },
    status: data?.status ?? 1,
  }
}

export function isActivityContainsPatientId(
  options?: {
    label: string
    value: number
    is_patient_id: boolean
  }[],
  activities?: number[]
) {
  return !!options
    ?.filter((item) => activities?.includes(item?.value))
    ?.find((item2) => !!item2?.is_patient_id)
}
