import {
  GetMaterialRelation,
  MaterialDetailGlobalResponse,
  MaterialDetailProgramResponse,
} from '#services/material'

import { DEFAULT_VALUE } from './material.constants'

export function handleDefaultValue(
  type: 'global' | 'program',
  defaultValue?: MaterialDetailGlobalResponse | MaterialDetailProgramResponse,
  materialRelation?: GetMaterialRelation
) {
  if (type === 'program') {
    const programValue = defaultValue as MaterialDetailProgramResponse
    return {
      manufactures: programValue?.manufactures?.map((manufacture: any) => ({
        label: manufacture.name ?? '',
        value: manufacture.id ?? 0,
      })),
      activities:
        programValue?.material_activities?.map((data) => ({
          label: data?.name || '',
          value: data.id || 0,
          isPatientNeeded: Boolean(data?.is_patient),
        })) ?? null,
      material_companion: programValue?.material_companion?.map((data) => ({
        label: data.name || '',
        value: data.id || 0,
      })),
      is_addremove: Number(programValue?.is_addremove) || DEFAULT_VALUE.NO,
      entity_types: programValue?.addremove?.entity_types?.map((data) => ({
        label: data?.name || '',
        value: data?.id || 0,
      })),
      roles: programValue?.addremove?.roles,
    }
  }
  const globalValue = defaultValue as MaterialDetailGlobalResponse

  return {
    name: globalValue?.name || '',
    description: globalValue?.description || '',
    is_hierarchy: 1,
    material_level_id: globalValue?.material_level_id || 0,
    hierarchy_code: globalValue?.hierarchy_code || '',
    material_parent_ids: materialRelation
      ? materialRelation?.material_hierarchy?.[1]?.materials?.map((item) => ({
          label: item.name,
          value: item.id,
        }))
      : undefined,
    code: globalValue?.code || '',
    unit_of_consumption_id: globalValue?.unit_of_consumption
      ? {
          label: globalValue?.unit_of_consumption.name,
          value: globalValue?.unit_of_consumption?.id,
        }
      : undefined,
    unit_of_distribution_id: globalValue?.unit_of_distribution
      ? {
          label: globalValue?.unit_of_distribution.name,
          value: globalValue?.unit_of_distribution?.id,
        }
      : undefined,
    consumption_unit_per_distribution_unit:
      globalValue?.consumption_unit_per_distribution_unit?.toString() || '',
    min_retail_price: globalValue?.min_retail_price || 0,
    max_retail_price: globalValue?.max_retail_price || 0,
    is_temperature_sensitive: globalValue?.is_temperature_sensitive || 0,
    min_temperature: globalValue?.min_temperature || 0,
    max_temperature: globalValue?.max_temperature || 0,
    material_type_id: globalValue?.material_type
      ? {
          label: globalValue?.material_type.name,
          value: globalValue?.material_type?.id,
        }
      : undefined,
    material_subtype_id: globalValue?.material_subtype
      ? {
          label: globalValue?.material_subtype.name,
          value: globalValue?.material_subtype?.id,
        }
      : undefined,
    is_managed_in_batch: globalValue?.is_managed_in_batch || 0,
    is_stock_opname_mandatory: globalValue?.is_stock_opname_mandatory || 0,
    program_ids: globalValue?.programs
      ? globalValue?.programs?.map((x: any) => x.id)
      : [],
  }
}
