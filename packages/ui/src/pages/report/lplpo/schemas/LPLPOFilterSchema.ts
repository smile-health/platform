import { UseFilter } from '#components/filter'
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

import { getDefaultImmunizationActivities } from '../../../dashboard/dashboard.constant'

export default function LPLPOFilterSchema(
  t: TFunction<'lplpo'>,
  tDashboard: TFunction<'dashboard'>
) {
  const isManager = hasPermission('lplpo-filter')
  const user = getUserStorage()
  const program = getProgramStorage()
  const useInitialProvince = Boolean(user?.entity?.province)
  const useInitialRegency = Boolean(user?.entity?.regency)
  const isDisableProvince = isManager && useInitialProvince
  const isDisableRegency = isManager && useInitialRegency
  const provinceInitialOption = {
    label: user?.entity?.province?.name ?? '',
    value: user?.entity?.province?.id,
  }
  const regencyInitialOption = {
    label: user?.entity?.regency?.name ?? '',
    value: user?.entity?.regency?.id,
  }

  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)
      : null

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
      defaultValue: useInitialProvince ? provinceInitialOption : null,
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
      defaultValue: useInitialRegency ? regencyInitialOption : null,
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
      defaultValue: defaultActivities,
    },
    {
      id: 'select-entity',
      type: 'select-async-paginate',
      required: true,
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
    {
      id: 'date',
      type: 'month-year-picker',
      required: true,
      name: 'date',
      label: t('form.month-year.label'),
      placeholder: t('form.month-year.placeholder'),
      minValue: '2020-01',
      maxValue: dayjs().subtract(1, 'month').format('YYYY-MM'),
      renderAs: 'label',
      defaultValue: null,
    },
  ] satisfies UseFilter
}
