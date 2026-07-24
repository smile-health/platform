import { parseDate } from '@internationalized/date'
import { UseFilter } from '#components/filter'
import { BOOLEAN } from '#constants/common'
import { ENTITY_TYPE } from '#constants/entity'
import { KFA_LEVEL } from '#constants/material'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import {
  getMaterialLevels,
  loadMaterial,
  loadMaterialType,
} from '#services/material'
import { hasPermission } from '#shared/permission/index'
import { TProgram } from '#types/program'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { getDefaultImmunizationActivities } from '../../../dashboard/dashboard.constant'

export const reconciliationFilterSchema = ({
  t,
  tDashboard,
  program,
}: {
  t: TFunction<'reconciliation'>
  tDashboard: TFunction<'dashboard'>
  program: TProgram
}): UseFilter => {
  const user = getUserStorage()

  const provinceInitialOption = {
    label: user?.entity?.province?.name ?? '',
    value: user?.entity?.province?.id,
  }

  const regencyInitialOption = {
    label: user?.entity?.regency?.name ?? '',
    value: user?.entity?.regency?.id,
  }

  const isDisabledProvinceByRole = !hasPermission(
    'reconciliation-enable-select-entity-type-1'
  )
  const isDisabledRegencyByRole = !hasPermission(
    'reconciliation-enable-select-entity-type-2'
  )
  const maxValueDate = dayjs(new Date()).add(1, 'day').format('YYYY-MM-DD')

  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)[0]
      : null

  return [
    {
      id: 'reconciliation__list__activity_id',
      type: 'select-async-paginate',
      name: 'activity_id',
      isMulti: false,
      label: t('filter.activity.label'),
      placeholder: t('filter.activity.placeholder'),
      className: '',
      defaultValue: defaultActivities,
      clearOnChangeFields: ['material_id'],
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
    },
    {
      id: 'reconciliation__list__material_type_id',
      type: 'select-async-paginate',
      name: 'material_type_id',
      isMulti: false,
      label: t('filter.material_type.label'),
      placeholder: t('filter.material_type.placeholder'),
      className: '',
      defaultValue: null,
      clearOnChangeFields: ['material_id'],
      loadOptions: loadMaterialType,
      additional: { page: 1 },
    },
    {
      id: 'stock__opname__list__kfa_level',
      type: 'select',
      name: 'material_level_id',
      isMulti: false,
      isClearable: false,
      hidden: !program?.config?.material?.is_hierarchy_enabled,
      required: program?.config?.material?.is_hierarchy_enabled,
      label: t('filter.material_kfa_level.label'),
      placeholder: t('filter.material_kfa_level.placeholder'),
      clearOnChangeFields: ['material_id'],
      loadOptions: async () => {
        const response = await getMaterialLevels({
          page: 1,
          paginate: 50,
          enable_only: BOOLEAN.TRUE,
        })

        return response?.data?.map((item) => ({
          label: item?.name,
          value: item?.id,
        }))
      },
      defaultValue: {
        value: KFA_LEVEL.KFA_92.id,
        label: KFA_LEVEL.KFA_92.label,
      },
    },
    {
      id: 'reconciliation__list__material_id',
      type: 'select-async-paginate',
      name: 'material_id',
      isMulti: false,
      label: t('filter.material.label'),
      placeholder: t('filter.material.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadMaterial,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        program_id: program?.id,
        is_with_activities: true,
        is_vaccine: getReactSelectValue('material_type_id')?.toString() ?? null,
        material_activities:
          getReactSelectValue('activity_id')?.toString() ?? null,
        material_level_id: getReactSelectValue('material_level_id') ?? null,
      }),
    },
    {
      id: 'reconciliation__list__period',
      type: 'date-range-picker',
      name: 'period',
      label: t('filter.period.label'),
      className: '',
      defaultValue: null,
      maxValue: maxValueDate,
    },
    {
      id: 'reconciliation__list__created_date',
      type: 'date-range-picker',
      name: 'created_date',
      label: t('filter.created_date.label'),
      className: '',
      maxValue: maxValueDate,
      defaultValue: {
        start: dayjs().toISOString(),
        end: dayjs().toISOString(),
      },
    },
    {
      id: 'reconciliation__list__entity_tag_id',
      type: 'select-async-paginate',
      name: 'entity_tag_id',
      isMulti: false,
      label: t('filter.entity_tag.label'),
      placeholder: t('filter.entity_tag.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadEntityTags,
      additional: { page: 1 },
    },
    {
      id: 'reconciliation__list__province_id',
      type: 'select-async-paginate',
      name: 'province_id',
      isMulti: false,
      label: t('filter.province.label'),
      placeholder: t('filter.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: isDisabledProvinceByRole,
      clearOnChangeFields: ['regency_id', 'entity_id'],
      additional: { page: 1 },
      defaultValue: isDisabledProvinceByRole ? provinceInitialOption : null,
    },
    {
      id: 'reconciliation__list__regency_id',
      type: 'select-async-paginate',
      name: 'regency_id',
      isMulti: false,
      label: t('filter.city.label'),
      placeholder: t('filter.city.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }: { getReactSelectValue: any }) =>
        !getReactSelectValue('province_id') || isDisabledRegencyByRole,
      clearOnChangeFields: ['entity_id'],
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('province_id') && {
          parent_id: getReactSelectValue('province_id'),
        }),
      }),
      defaultValue: isDisabledRegencyByRole ? regencyInitialOption : null,
    },
    {
      id: 'transaction__list__entity_id',
      type: 'select-async-paginate',
      name: 'entity_id',
      isMulti: false,
      label: t('filter.primary_health_care.label'),
      placeholder: t('filter.primary_health_care.placeholder'),
      loadOptions: loadEntities,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        province_ids: getReactSelectValue('province_id')?.toString() ?? null,
        regency_ids: getReactSelectValue('regency_id')?.toString() ?? null,
        type_ids: ENTITY_TYPE.FASKES.toString(),
        is_vendor: BOOLEAN.TRUE,
      }),
      defaultValue: null,
    },
  ]
}

export default {}
