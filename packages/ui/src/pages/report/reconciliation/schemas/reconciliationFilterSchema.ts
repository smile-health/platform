import { UseFilter } from '#components/filter'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { hasPermission } from '#shared/permission/index'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { getDefaultImmunizationActivities } from '../../../dashboard/dashboard.constant'

export default function reconciliationFilterSchema(
  t: TFunction<'reconciliationReport'>,
  tDashboard: TFunction<'dashboard'>,
  lang?: string
) {
  const isManager = hasPermission('dashboard-manager-location-filter')
  const user = getUserStorage()

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

  const program = getProgramStorage()

  const defaultActivityValues =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)[0]
      : null

  return [
    {
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity',
      label: t('form.activity.label'),
      placeholder: t('form.activity.placeholder'),
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
      defaultValue: defaultActivityValues,
    },
    {
      id: 'periode-date',
      type: 'month-year-picker',
      name: 'periode',
      label: t('form.created_data.label'),
      placeholder: t('form.created_data.placeholder'),
      mode: 'range',
      defaultValue: {
        start: dayjs().startOf('year').format('YYYY-MM-DD'),
        end: dayjs().endOf('year').format('YYYY-MM-DD'),
      },
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
      clearOnChangeFields: ['entity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province'),
        page: 1,
      }),
      defaultValue: useInitialRegency ? regencyInitialOption : null,
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
