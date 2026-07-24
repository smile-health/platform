'use client'

import { UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
import { loadAssetModel } from '#services/asset-model'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { EntityTag } from '../../dashboard.constant'
import { filterOfUser } from '../../dashboard.helper'
import { RequestloginResponse } from '#types/auth'

export default function dashboardTemperatureMonitoringFilterSchema(
  t: TFunction<['dashboard', 'dashboardAssetTemperatureMonitoring']>,
  lang: string,
  tDashboard: TFunction<'dashboard'>
) {
  const isAllowed = hasPermission('dashboard-manager-location-filter')
  const user = getUserStorage()
  const hasQueryParams =
    typeof window !== 'undefined' && window.location.search.length > 1

  let defaultEntityTag: { value: number; label: string }[] = []

  if (user?.entity?.regency) {
    defaultEntityTag = [
      {
        value: EntityTag.Dinkes_City,
        label: tDashboard('data.entity_tag.regency'),
      },
    ]
  } else if (user?.entity?.province || user?.entity.name === 'UNDP') {
    defaultEntityTag = [
      {
        value: EntityTag.Diskes_Province,
        label: tDashboard('data.entity_tag.province'),
      },
    ]
  }

  const useInitialProvince = Boolean(user?.entity?.province)
  const useInitialRegency = Boolean(user?.entity?.regency)
  const isDisableProvince = isAllowed && useInitialProvince
  const isDisableRegency = isAllowed && useInitialRegency
  const { defaultProvince, defaultRegency } = filterOfUser(
        user as RequestloginResponse
      )

  return [
    {
      id: 'date-range',
      type: 'date-range-picker',
      name: 'date',
      label: t('dashboardAssetTemperatureMonitoring:form.date.label'),
      maxRange: 31,
      maxValue: dayjs().format('YYYY-MM-DD'),
      defaultValue: {
        start: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD'),
      },
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('dashboardAssetTemperatureMonitoring:form.province.label'),
      placeholder: t(
        'dashboardAssetTemperatureMonitoring:form.province.placeholder'
      ),
      loadOptions: loadProvinces,
      disabled: isDisableProvince,
      clearOnChangeFields: ['regency', 'entity'],
      additional: { page: 1 },
      defaultValue:
        !hasQueryParams ? defaultProvince : null,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency',
      label: t('dashboardAssetTemperatureMonitoring:form.city.label'),
      placeholder: t(
        'dashboardAssetTemperatureMonitoring:form.city.placeholder'
      ),
      disabled: ({ getValue }) => !getValue('province') || isDisableRegency,
      loadOptions: loadRegencies,
      clearOnChangeFields: ['entity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue:
        !hasQueryParams ? defaultRegency : null,
    },
    {
      id: 'select-entity',
      type: 'select-async-paginate',
      name: 'entity',
      label: t('dashboardAssetTemperatureMonitoring:form.entity.label'),
      placeholder: t(
        'dashboardAssetTemperatureMonitoring:form.entity.placeholder'
      ),
      loadOptions: loadEntities,
      clearOnChangeFields: ['entity_tags'],
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: 1,
        type_ids: 3,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('regency'),
        isGlobal: true,
      }),
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag',
      label: t('dashboardAssetTemperatureMonitoring:form.entity_tag.label'),
      placeholder: t(
        'dashboardAssetTemperatureMonitoring:form.entity_tag.placeholder'
      ),
      loadOptions: loadEntityTags,
      additional: { page: 1, lang, isGlobal: true },
      isMulti: true,
      defaultValue: hasQueryParams ? [] : defaultEntityTag,
    },
    {
      id: 'select-asset-model',
      type: 'select-async-paginate',
      name: 'asset_model',
      label: t('dashboardAssetTemperatureMonitoring:form.asset_model.label'),
      placeholder: t(
        'dashboardAssetTemperatureMonitoring:form.asset_model.placeholder'
      ),
      loadOptions: loadAssetModel,
      additional: { page: 1, isGlobal: true, is_cce: 1 },
      isMulti: true,
      defaultValue: null,
    },
  ] satisfies UseFilter
}
