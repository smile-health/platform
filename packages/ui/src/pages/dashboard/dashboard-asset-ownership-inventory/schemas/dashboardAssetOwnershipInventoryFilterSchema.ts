'use client'

import { UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import { loadAssetModel } from '#services/asset-model'
import { loadAssetType } from '#services/asset-type'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadManufacturers } from '#services/manufacturer'
import { loadStatusAsset } from '#services/status-asset'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import {
  loadAssetElectricity,
  loadVendor,
} from '../../../asset-inventory/services/asset-inventory.services'
import {
  assetCapacityData,
  assetOwnershipData,
} from '../dashboard-asset-ownership-inventory.constant'
import { generatedYearOptions } from '../dashboard-asset-ownership-inventory.helper'
import { RequestloginResponse } from '#types/auth'
import { filterOfUser } from '../../dashboard.helper'

export default function dashboardAssetOwnershipInventoryFilterSchema(
  t: TFunction<'dashboardAssetOwnershipInventory'>,
  lang: string,
  predefinedAssetTypes?: { label: string; value: number }[] | null
) {
  const isManager = hasPermission('dashboard-manager-location-filter')
  const user = getUserStorage()

  const useInitialProvince = Boolean(user?.entity?.province)
  const useInitialRegency = Boolean(user?.entity?.regency)
  const isDisableProvince = isManager && useInitialProvince
  const isDisableRegency = isManager && useInitialRegency
  const { defaultProvince, defaultRegency } = filterOfUser(
      user as RequestloginResponse
    )

  return [
    {
      id: 'periode-start-date',
      type: 'date-picker',
      name: 'from',
      label: t('form.date.periode.start.label'),
      disabled: true,
      clearable: false,
      defaultValue: '2021-01-01',
    },
    {
      id: 'periode-end-date',
      type: 'date-picker',
      name: 'to',
      label: t('form.date.periode.end.label'),
      clearable: false,
      minValue: '2021-01-01',
      defaultValue: dayjs().format('YYYY-MM-DD'),
    },
    {
      id: 'select-asset-type',
      type: 'select-async-paginate',
      name: 'type_ids',
      label: t('form.asset_type.label'),
      placeholder: t('form.asset_type.placeholder'),
      loadOptions: loadAssetType,
      additional: { page: 1 },
      isMulti: true,
      defaultValue: predefinedAssetTypes as OptionType[] | null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag_ids',
      label: t('form.entity_tag.label'),
      placeholder: t('form.entity_tag.placeholder'),
      loadOptions: loadEntityTags,
      additional: { page: 1, lang, isGlobal: true },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-working-status',
      type: 'select-async-paginate',
      name: 'working_status_ids',
      label: t('form.working_status.label'),
      placeholder: t('form.working_status.placeholder'),
      loadOptions: loadStatusAsset,
      additional: { page: 1 },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-asset-model',
      type: 'select-async-paginate',
      name: 'model_ids',
      label: t('form.asset_model.label'),
      placeholder: t('form.asset_model.placeholder'),
      loadOptions: loadAssetModel,
      additional: { page: 1, isGlobal: true },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-manufacture',
      type: 'select-async-paginate',
      name: 'manufacture_ids',
      label: t('form.manufacture.label'),
      placeholder: t('form.manufacture.placeholder'),
      loadOptions: loadManufacturers,
      additional: { page: 1 },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-production-year',
      type: 'select',
      name: 'prod_years',
      label: t('form.production_year.label'),
      placeholder: t('form.production_year.placeholder'),
      isClearable: true,
      options: generatedYearOptions(),
      defaultValue: null,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province_ids',
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: isDisableProvince,
      isMulti: true,
      clearOnChangeFields: ['regency_ids', 'entity_ids'],
      additional: { page: 1 },
      defaultValue: defaultProvince,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regency_ids',
      label: t('form.regency.label'),
      isMulti: true,
      placeholder: t('form.regency.placeholder'),
      disabled: ({ getValue }) => !getValue('province_ids') || isDisableRegency,
      loadOptions: loadRegencies,
      clearOnChangeFields: ['entity_ids'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('province_ids'),
        page: 1,
      }),
      defaultValue: defaultRegency,
    },
    {
      id: 'select-primary-health-care',
      type: 'select-async-paginate',
      name: 'entity_ids',
      label: t('form.health_facilities.label'),
      placeholder: t('form.health_facilities.placeholder'),
      loadOptions: loadEntities,
      clearOnChangeFields: ['entity_tags'],
      disabled: ({ getValue }) => {
        const entityTags = getValue('entity_tags') as OptionType[]
        return (
          entityTags?.length > 0 ||
          !getValue('province_ids') ||
          !getValue('regency_ids')
        )
      },
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        is_vendor: 1,
        type_ids: 3,
        province_ids: getReactSelectValue('province_ids'),
        regency_ids: getReactSelectValue('regency_ids'),
        isGlobal: true,
      }),
      defaultValue: null,
    },
    {
      id: 'select-budget-year',
      type: 'select',
      name: 'budget_years',
      label: t('form.budget_year.label'),
      placeholder: t('form.budget_year.placeholder'),
      options: generatedYearOptions(),
      defaultValue: null,
      isClearable: true,
    },
    {
      id: 'select-capacity-data',
      type: 'select',
      name: 'asset_capacity_ids',
      label: t('form.capacity_data.label'),
      placeholder: t('form.capacity_data.placeholder'),
      options: assetCapacityData(t) as any,
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-vendor',
      type: 'select-async-paginate',
      name: 'vendor_ids',
      label: t('form.vendor.label'),
      placeholder: t('form.vendor.placeholder'),
      loadOptions: loadVendor,
      additional: { page: 1, is_provider: 0, isGlobal: 1 },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-communication-provider',
      type: 'select-async-paginate',
      name: 'communication_provider_ids',
      label: t('form.communication_provider.label'),
      placeholder: t('form.communication_provider.placeholder'),
      loadOptions: loadVendor,
      additional: { page: 1, is_provider: 1, isGlobal: 1 },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-power-availability',
      type: 'select-async-paginate',
      name: 'power_available_ids',
      label: t('form.power_availability.label'),
      placeholder: t('form.power_availability.placeholder'),
      loadOptions: loadAssetElectricity,
      additional: { page: 1 },
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'select-ownership-status',
      type: 'select',
      name: 'ownership_status_ids',
      label: t('form.ownership_status.label'),
      placeholder: t('form.ownership_status.placeholder'),
      options: assetOwnershipData(t) as any,
      isMulti: true,
      defaultValue: null,
    },
    {
      id: 'switch-is-data-removed',
      type: 'switch',
      name: 'is_deleted',
      label: t('form.status.label'),
      size: 'lg',
      yesLabel: '',
      noLabel: '',

      labelInside: {
        on: t('form.status.yes'),
        off: t('form.status.no'),
      },
      callBack: ({ setValue, value }) => {
        setValue(
          'is_deleted',
          value === BOOLEAN.FALSE ? BOOLEAN.TRUE : BOOLEAN.FALSE
        )
      },
    },
  ] satisfies UseFilter
}
