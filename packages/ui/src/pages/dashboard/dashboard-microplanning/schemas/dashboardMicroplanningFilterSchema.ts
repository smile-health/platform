import { UseFilter } from '#components/filter'
import {
  loadProvinces,
  loadRegencies,
  loadSubdistricts,
  loadVillages,
} from '#services/location'
import {
  loadMaterial,
  loadBatch
} from '#services/material'
import { loadMoreTargetGroup } from '#services/target-group'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import { filterOfUser } from '../../dashboard.helper'
import { RequestloginResponse } from '#types/auth'

export default function dashboardMicroplanningFilterSchema(
  t: TFunction<'dashboardMicroplanning'>,
  isNew = false
) {
  const isManager = hasPermission('dashboard-manager-location-filter')
  const user = getUserStorage()

  const firstJanuaryThisYear = dayjs().startOf('year').format('YYYY-MM-DD')
  const useInitialProvince = Boolean(user?.entity?.province)
  const useInitialRegency = Boolean(user?.entity?.regency)
  const isDisableProvince = isManager && useInitialProvince
  const { defaultProvince, defaultRegency } = filterOfUser(
        user as RequestloginResponse
      )

  return [
    {
      id: 'period',
      type: 'date-range-picker',
      name: 'period',
      label: t('form.period.label'),
      clearable: false,
      withPreset: true,
      multicalendar: true,
      defaultValue: {
        start: firstJanuaryThisYear,
        end: dayjs().format('YYYY-MM-DD'),
      },
    },
    {
      id: 'select-material',
      type: 'select-async-paginate',
      name: 'material',
      label: t('form.material.label'),
      placeholder: t('form.material.placeholder'),
      loadOptions: loadMaterial,
      clearOnChangeFields: ['batch'],
      additional: { page: 1 },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-batch',
      type: 'select-async-paginate',
      name: 'batch',
      isMulti: true,
      label: t('form.batch.label'),
      placeholder: t('form.batch.placeholder'),
      disabled: ({ getReactSelectValue }) => !getReactSelectValue('material'),
      loadOptions: loadBatch,
      clearOnChangeFields: [],
      additional: ({ getReactSelectValue }) => ({
        material_id: getReactSelectValue('material')
      }),
      defaultValue: null,
    },
    {
      id: 'select-target-group',
      type: 'select-async-paginate',
      name: 'target_group',
      label: t('form.target.group.label'),
      placeholder: t('form.target.group.placeholder'),
      loadOptions: loadMoreTargetGroup,
      isMulti: true,
      additional: {
        page: 1,
      },
      defaultValue: null,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      isMulti: true,
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: isDisableProvince,
      clearOnChangeFields: ['city', 'sub_district', 'village'],
      additional: { page: 1 },
      defaultValue: defaultProvince,
    },
    {
      id: 'select-city',
      type: 'select-async-paginate',
      name: 'city',
      isMulti: true,
      label: t('form.city.label'),
      placeholder: t('form.city.placeholder'),
      disabled: ({ getReactSelectValue }) => !getReactSelectValue('province'),
      loadOptions: loadRegencies,
      clearOnChangeFields: ['sub_district', 'village'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue: defaultRegency,
    },
    {
      id: 'select-sub-district',
      type: 'select-async-paginate',
      name: 'sub_district',
      isMulti: true,
      label: t('form.sub-district.label'),
      placeholder: t('form.sub-district.placeholder'),
      loadOptions: loadSubdistricts,
      disabled: ({ getReactSelectValue }) => !getReactSelectValue('city'),
      clearOnChangeFields: ['village'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('city'),
        page: 1,
      }),
      defaultValue: null,
    },
    {
      id: 'select-village',
      type: 'select-async-paginate',
      name: 'village',
      isMulti: true,
      label: t('form.village.label'),
      placeholder: t('form.village.placeholder'),
      loadOptions: loadVillages,
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('sub_district'),
      clearOnChangeFields: [],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('sub_district'),
        page: 1,
      }),
      defaultValue: null,
    },
    {
      id: 'select-gender',
      type: 'select',
      name: 'gender',
      label: t('form.gender.label'),
      placeholder: t('form.gender.placeholder'),
      isClearable: true,
      isUsingReactQuery: false,
      options: [
        { value: 1, label: t('form.gender.options.male') },
        { value: 2, label: t('form.gender.options.female') },
      ],
      hidden: !isNew,
      defaultValue: null,
    }
  ] satisfies UseFilter
}
