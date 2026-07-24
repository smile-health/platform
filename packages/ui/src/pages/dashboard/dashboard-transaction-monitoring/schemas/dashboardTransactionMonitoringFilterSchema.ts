import { UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
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
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import {
  defaultEntityTags,
  getDefaultImmunizationActivities,
} from '../../dashboard.constant'
import {
  informationTypeList,
  TransactionType,
  transactionTypeList,
} from '../dashboard-transaction-monitoring.constant'
import { filterOfUser } from '../../dashboard.helper'
import { RequestloginResponse } from '#types/auth'

export default function dashboardTransactionMonitoringFilterSchema(
  t: TFunction<'dashboardMonitoringTransactions'>,
  tDashboard: TFunction<'dashboard'>,
  lang = 'en',
  isNew = false
) {
  const firstJanuaryThisYear = dayjs().startOf('year').format('YYYY-MM-DD')
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
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity',
      label: t('form.activity.label'),
      placeholder: t('form.activity.placeholder'),
      loadOptions: loadActivityOptions,
      clearOnChangeFields: ['material'],
      additional: { page: 1 },
      isMulti: true,
      defaultValue: defaultActivities,
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
      id: 'select-material-level',
      type: 'select',
      name: 'material_level',
      label: t('form.material.level.label'),
      placeholder: t('form.material.level.placeholder'),
      clearOnChangeFields: ['material'],
      isClearable: false,
      loadOptions: async () => {
        const response = await getMaterialLevels({
          page: 1,
          paginate: 50,
          enable_only: 1,
        })

        return response?.data?.map((item) => ({
          label: item?.name,
          value: item?.id,
        }))
      },
      defaultValue: {
        value: 2,
        label: t('data.material_level.active_subtance'),
      },
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
        material_level_id: getReactSelectValue('material_level'),
        program_id: program?.id,
      }),
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tags',
      label: t('form.entity_tag.label'),
      placeholder: t('form.entity_tag.placeholder'),
      loadOptions: loadEntityTags,
      additional: { page: 1, lang },
      clearOnChangeFields: ['entity'],
      disabled: ({ getValue }) => {
        const entity = getValue('entity') as OptionType
        return !!entity?.value
      },
      isMulti: true,
      defaultValue: defaultEntityTags(tDashboard),
    },
    {
      id: 'select-transaction-type',
      type: 'select',
      name: 'transaction_type',
      label: t('form.transaction_type.label'),
      placeholder: t('form.transaction_type.placeholder'),
      isClearable: false,
      isUsingReactQuery: false,
      options: transactionTypeList(t),
      hidden: isNew,
      defaultValue: isNew
        ? null
        : {
            label: t('data.transaction_type.consumption'),
            value: TransactionType.Consumption,
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
      clearOnChangeFields: ['entity_tags'],
      disabled: ({ getValue }) => {
        const entityTags = getValue('entity_tags') as OptionType[]
        return (
          entityTags?.length > 0 ||
          !getValue('province') ||
          !getValue('regency')
        )
      },
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
      type: 'radio',
      name: 'informationType',
      label: t('form.information_type.label'),
      options: informationTypeList(t),
      defaultValue: '0',
    },
  ] satisfies UseFilter
}
