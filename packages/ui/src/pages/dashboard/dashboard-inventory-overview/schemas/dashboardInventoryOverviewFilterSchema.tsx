import { UseFilter } from '#components/filter'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import { loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadMaterial, loadMaterialType } from '#services/material'
import { loadStatusAsset } from '#services/status-asset'
import { hasPermission } from '#shared/permission/index'
import { RequestloginResponse } from '#types/auth'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { getDefaultImmunizationActivities } from '../../dashboard.constant'
import { filterOfUser } from '../../dashboard.helper'

export default function dashboardInventoryOverviewFilterSchema(
  t: TFunction<'dashboardInventoryOverview'>,
  tDashboard: TFunction<'dashboard'>,
  lang = 'en'
) {
  const isManager = hasPermission('dashboard-manager-location-filter')
  const user = getUserStorage()
  const program = getProgramStorage()

  const isImmun = program?.key === ProgramEnum.Immunization
  const useInitialProvince = Boolean(user?.entity?.province)
  const useInitialRegency = Boolean(user?.entity?.regency)
  const isDisableProvince = isManager && useInitialProvince
  const isDisableRegency = isManager && useInitialRegency
  const { defaultProvince, defaultRegency } = filterOfUser(
    user as RequestloginResponse
  )

  const defaultActivityValues = isImmun
    ? getDefaultImmunizationActivities(tDashboard)
    : null

  const statusOperationalFilter = (
    isImmun
      ? [
          {
            id: 'operational-status',
            type: 'select-async-paginate',
            name: 'operational_status',
            isMulti: false,
            label: t('form.operational_status.label'),
            placeholder: t('form.operational_status.placeholder'),
            loadOptions: loadStatusAsset,
            additional: { page: 1 },
            defaultValue: {
              label: t('functional'),
              value: 1,
            },
          },
        ]
      : []
  ) satisfies UseFilter

  return [
    {
      id: 'period-start-date',
      type: 'date-picker',
      name: 'period_start',
      label: t('form.date.period.start.label'),
      disabled: true,
      clearable: false,
      defaultValue: '2021-01-01',
    },
    {
      id: 'period-end-date',
      type: 'date-picker',
      name: 'period_end',
      label: t('form.date.period.end.label'),
      clearable: false,
      minValue: '2021-01-01',
      defaultValue: dayjs().format('YYYY-MM-DD'),
    },
    {
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity',
      label: t('form.activity.label'),
      placeholder: t('form.activity.placeholder'),
      loadOptions: loadActivityOptions,
      clearOnChangeFields: ['material'],
      additional: { page: 1 },
      isMulti: true,
      defaultValue: defaultActivityValues,
    },
    {
      id: 'select-material-type',
      type: 'select-async-paginate',
      name: 'material_type',
      label: t('form.material.type.label'),
      placeholder: t('form.material.type.placeholder'),
      loadOptions: loadMaterialType,
      clearOnChangeFields: ['material'],
      additional: {
        page: 1,
      },
      defaultValue: null,
    },
    {
      id: 'select-material-name',
      type: 'select-async-paginate',
      name: 'material',
      label: t('form.material.name.label'),
      placeholder: t('form.material.name.placeholder'),
      loadOptions: loadMaterial,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        status: 1,
        activity_id: getReactSelectValue('activity'),
        material_type_ids: getReactSelectValue('material_type'),
        material_level_id: 2,
        program_id: program?.id,
      }),
      isMulti: true,
      defaultValue: null,
    },
    ...statusOperationalFilter,
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: isDisableProvince,
      clearOnChangeFields: ['regency', 'entity'],
      additional: { page: 1 },
      defaultValue: defaultProvince,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency',
      label: t('form.regency.label'),
      placeholder: t('form.regency.placeholder'),
      disabled: ({ getValue }) => !getValue('province') || isDisableRegency,
      loadOptions: loadRegencies,
      clearOnChangeFields: ['entity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue: defaultRegency,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag',
      label: t('form.entity_tag.label'),
      placeholder: t('form.entity_tag.placeholder'),
      loadOptions: loadEntityTags,
      additional: { page: 1, lang },
      defaultValue: null,
    },
  ] satisfies UseFilter
}
