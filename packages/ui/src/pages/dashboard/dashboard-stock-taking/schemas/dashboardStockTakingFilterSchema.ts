import { UseFilter } from '#components/filter'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import { loadBatch } from '#services/batch'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadMaterial, loadMaterialType } from '#services/material'
import { loadStockTakingPeriods } from '#services/stock-taking'
import { hasPermission } from '#shared/permission/index'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { TFunction } from 'i18next'

import {
  defaultEntityTags,
  getDefaultImmunizationActivities,
} from '../../dashboard.constant'
import { filterOfUser } from '../../dashboard.helper'
import { RequestloginResponse } from '#types/auth'

export default function dashboardStockTakingFilterSchema(
  t: TFunction<'dashboardStockTaking'>,
  tDashboard: TFunction<'dashboard'>,
  lang = 'en'
) {
  const isManager = hasPermission('dashboard-manager-location-filter')
  const user = getUserStorage()
  const program = getProgramStorage()

  const useInitialProvince = Boolean(user?.entity?.province)
  const useInitialRegency = Boolean(user?.entity?.regency)
  const isDisableProvince = isManager && useInitialProvince
  const isDisableRegency = isManager && useInitialRegency
  const { defaultProvince, defaultRegency } = filterOfUser(
        user as RequestloginResponse
      )

  const defaultActivityValues =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)
      : null

  return [
    {
      id: 'select-stock-taking-period',
      type: 'select-async-paginate',
      name: 'period',
      label: t('form.period.label'),
      placeholder: t('form.period.placeholder'),
      loadOptions: loadStockTakingPeriods,
      additional: { page: 1 },
      required: true,
      isSearchable: false,
      defaultValue: null,
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
      required: true,
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
      isMulti: true,
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
    {
      id: 'select-batch',
      type: 'select-async-paginate',
      name: 'batch',
      label: 'Batch',
      placeholder: 'Batch',
      disabled: ({ getValue }) => Boolean(getValue('expired')),
      loadOptions: loadBatch,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        material_ids: getReactSelectValue('material'),
        material_level_id: 2,
      }),
      defaultValue: null,
    },
    {
      id: 'expired-date',
      type: 'date-range-picker',
      name: 'expired',
      disabled: ({ getValue }) => Boolean(getValue('batch')),
      label: t('form.expired.label'),
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tags',
      label: t('form.entity_tag.label'),
      placeholder: t('form.entity_tag.placeholder'),
      required: true,
      loadOptions: loadEntityTags,
      additional: { page: 1, lang },
      isMulti: true,
      defaultValue: defaultEntityTags(tDashboard),
    },
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
      id: 'select-primary-health-care',
      type: 'select-async-paginate',
      name: 'entity',
      label: t('form.health_facilities.label'),
      placeholder: t('form.health_facilities.placeholder'),
      loadOptions: loadEntities,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: 1,
        type_ids: 3,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('regency'),
      }),
      defaultValue: null,
    },
  ] satisfies UseFilter
}
