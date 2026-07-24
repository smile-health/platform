import { UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import { loadEntities } from '#services/entity'
import {
  loadProvinces,
  loadRegencies,
  loadSubdistricts,
} from '#services/location'
import { hasPermission } from '#shared/permission/index'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import {
  getDefaultImmunizationActivities,
  yearList,
} from '../../dashboard.constant'
import { filterOfUser } from '../../dashboard.helper'
import { RequestloginResponse } from '#types/auth'

export default function dashboardReportFilterSchema(
  t: TFunction<'dashboardReport'>,
  tDashboard: TFunction<'dashboard'>,
  period: 'monthly' | 'yearly'
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
  
  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)
      : null

  const years = yearList()

  const monthYearFilter = [
    {
      id: 'date',
      type: 'month-year-picker',
      name: 'date',
      label: t('form.month-year.label'),
      placeholder: t('form.month-year.placeholder'),
      minValue: '2020-01',
      maxValue: dayjs().subtract(1, 'month').format('YYYY-MM'),
      renderAs: 'label',
      required: true,
      defaultValue: null,
    },
  ] satisfies UseFilter

  const yearFilter = [
    {
      id: 'date',
      type: 'select',
      name: 'date',
      label: t('form.year.label'),
      placeholder: t('form.year.placeholder'),
      options: years,
      required: true,
      isUsingReactQuery: false,
      defaultValue: null,
    },
  ] satisfies UseFilter

  return [
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: isDisableProvince,
      clearOnChangeFields: ['regency', 'subdistrict', 'entity'],
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
      clearOnChangeFields: ['subdistrict', 'entity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue: defaultRegency,
    },
    {
      id: 'select-subdistrict',
      type: 'select-async-paginate',
      name: 'subdistrict',
      label: t('form.subdistrict.label'),
      placeholder: t('form.subdistrict.placeholder'),
      disabled: ({ getValue }) => !getValue('regency'),
      loadOptions: loadSubdistricts,
      clearOnChangeFields: ['entity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('regency'),
        page: 1,
      }),
      defaultValue: null,
    },
    {
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity',
      label: t('form.activity.label'),
      placeholder: t('form.activity.placeholder'),
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
      isMulti: true,
      onChange: (v: OptionType[]) => {
        const first = v?.[0]
        const last = v?.[v?.length - 1]
        if (
          v?.length > 1 &&
          (first?.label === 'COVID-19' || last?.label === 'COVID-19')
        ) {
          return [last]
        }

        return v
      },
      defaultValue: defaultActivities,
    },
    {
      id: 'select-entity',
      type: 'select-async-paginate',
      name: 'entity',
      label: t('form.entity.label'),
      placeholder: t('form.entity.placeholder'),
      loadOptions: loadEntities,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: 1,
        province_ids: getReactSelectValue('province'),
        regency_ids: getReactSelectValue('regency'),
        sub_district_ids: getReactSelectValue('subdistrict'),
      }),
      defaultValue: null,
    },
    ...(period === 'monthly' ? monthYearFilter : yearFilter),
  ] satisfies UseFilter
}
