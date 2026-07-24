import { UseFilter } from '#components/filter'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { hasPermission } from '#shared/permission/index'
import { RequestloginResponse } from '#types/auth'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { EntityTag } from '../../../dashboard.constant'
import { filterOfUser } from '../../../dashboard.helper'

export const useDashboardColdStorageCapacityFilterSchema = (): UseFilter => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'dashboard', 'dashboardColdStorageCapacity'])

  const isAllowed = hasPermission('dashboard-manager-location-filter')
  const user = getUserStorage()
  let defaultEntityTag: { value: number; label: string }[] = []

  if (user?.entity?.regency) {
    defaultEntityTag = [
      {
        value: EntityTag.Dinkes_City,
        label: t('dashboard:data.entity_tag.regency'),
      },
    ]
  } else if (user?.entity?.province || user?.entity.name === 'UNDP') {
    defaultEntityTag = [
      {
        value: EntityTag.Diskes_Province,
        label: t('dashboard:data.entity_tag.province'),
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
      id: 'period',
      type: 'month-year-picker',
      name: 'period',
      label: t('dashboardColdStorageCapacity:filter.period.label'),
      maxValue: dayjs().format('YYYY-MM'),
      renderAs: 'label',
      clearable: false,
      defaultValue: {
        start: dayjs().format('YYYY-MM'),
        end: dayjs().format('YYYY-MM'),
      },
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
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
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
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
      id: 'select-entity',
      type: 'select-async-paginate',
      name: 'entity',
      label: t('dashboardColdStorageCapacity:filter.entity.label'),
      placeholder: t('dashboardColdStorageCapacity:filter.entity.placeholder'),
      loadOptions: loadEntities,
      clearOnChangeFields: ['entity_tag'],
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: 1,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('regency'),
        type_ids: 3,
        isGlobal: true,
      }),
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag',
      label: t('common:form.entity_tag.label'),
      placeholder: t('common:form.entity_tag.placeholder'),
      loadOptions: loadEntityTags,
      additional: { page: 1, lang: language, isGlobal: true },
      isMulti: true,
      defaultValue: defaultEntityTag,
    },
  ] satisfies UseFilter
}
