import { FilterFormSchema, UseFilter } from '#components/filter'
import { BOOLEAN } from '#constants/common'
import { ENTITY_TYPE } from '#constants/entity'
import { loadAssetModel } from '#services/asset-model'
import { loadAssetType } from '#services/asset-type'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { loadManufacturers } from '#services/manufacturer'
import { loadStatusAsset } from '#services/status-asset'
import { getUserStorage } from '#utils/storage/user'
import { TFunction } from 'i18next'

import { filterOfUser } from './asset-list.common'
import {
  assetRelation,
  assetTypeDefaults,
  tempLoaggerOptions,
} from './asset-list.constants'

type Params = {
  t: TFunction<['common', 'asset']>
  contextValue?: {
    setPagination: (value: { page?: number; paginate?: number }) => void
    viewTemperatureLogger?: boolean
    setViewTemperatureLogger?: (viewTemperatureLogger: boolean) => void
  }
}

export const assetFilterSchema = ({ t, contextValue }: Params): UseFilter => {
  const { setViewTemperatureLogger, viewTemperatureLogger } = contextValue || {}

  const userEntity = getUserStorage()
  const {
    isDisabledProvinceByRole,
    isDisabledRegencyByRole,
    defaultProvince,
    defaultRegency,
  } = filterOfUser(userEntity ?? undefined)

  return [
    {
      type: 'text',
      name: 'keyword',
      label: t('common:search_by'),
      placeholder: t('asset:columns.asset_name'),
      maxLength: 255,
      id: 'input-activity-search',
      defaultValue: '',
    },
    {
      id: 'asset__list__type',
      type: 'select-async-paginate',
      name: 'type_id',
      isMulti: true,
      label: t('asset:columns.asset_type'),
      placeholder: t('asset:columns.asset_type'),
      className: '',
      defaultValue: null,
      loadOptions: loadAssetType,
      disabled: viewTemperatureLogger,
      additional: { page: 1 },
    },
    {
      id: 'asset__list__show__logger__temperature',
      type: 'switch',
      name: 'only_type_logger',
      label: t('asset:columns.show_logger_temperature'),
      className: '',
      callBack: ({ setValue }) => {
        if (viewTemperatureLogger) {
          setValue('type_id', assetTypeDefaults(t))
          setValue('only_type_logger', BOOLEAN.FALSE)
          setViewTemperatureLogger?.(false)
        } else {
          setValue('type_id', null)
          setValue('manufacture_id', null)
          setValue('only_type_logger', BOOLEAN.TRUE)
          setViewTemperatureLogger?.(true)
        }
      },
    },
    {
      id: 'asset__list__manufacture',
      type: 'select-async-paginate',
      name: 'manufacture_id',
      isMulti: false,
      label: t('asset:columns.manufacture'),
      placeholder: t('asset:columns.manufacture'),
      className: '',
      defaultValue: null,
      loadOptions: loadManufacturers,
      disabled: viewTemperatureLogger,
      additional: { page: 1 },
    },
    {
      id: 'asset__list__relation',
      type: 'select',
      name: 'relation_asset',
      isMulti: false,
      label: t('asset:columns.relation'),
      placeholder: t('asset:columns.relation'),
      options: assetRelation(t),
      className: '',
      defaultValue: null,
    },
    {
      id: 'asset__working__status',
      type: 'select-async-paginate',
      name: 'logger_status_id',
      isMulti: false,
      label: t('asset:columns.working_status'),
      placeholder: t('asset:columns.working_status'),
      className: '',
      defaultValue: null,
      loadOptions: loadStatusAsset,
      additional: { page: 1 },
    },
    {
      id: 'asset__list__province_id',
      type: 'select-async-paginate',
      name: 'province_id',
      isMulti: false,
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: isDisabledProvinceByRole,
      clearOnChangeFields: ['regency_id', 'entity_id'],
      additional: { page: 1 },
      defaultValue: isDisabledProvinceByRole ? defaultProvince : null,
    } as FilterFormSchema,
    {
      id: 'asset__list__regency_id',
      type: 'select-async-paginate',
      name: 'regency_id',
      isMulti: false,
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('province_id') || isDisabledRegencyByRole,
      clearOnChangeFields: ['entity_id'],
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('province_id') && {
          parent_id: getReactSelectValue('province_id'),
        }),
      }),
      defaultValue: isDisabledRegencyByRole ? defaultRegency : null,
    },
    {
      id: 'asset__list__entity_id',
      type: 'select-async-paginate',
      name: 'entity_id',
      isMulti: false,
      label: t('common:form.integrated_healthcare.label'),
      placeholder: t('common:form.integrated_healthcare.placeholder'),
      loadOptions: loadEntities,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        province_ids: getReactSelectValue('province_id')?.toString() ?? null,
        regency_ids: getReactSelectValue('regency_id')?.toString() ?? null,
        type_ids: ENTITY_TYPE.FASKES.toString(),
        is_vendor: BOOLEAN.TRUE,
      }),
      defaultValue: null,
    },
    {
      id: 'asset__entity__tag',
      type: 'select-async-paginate',
      name: 'entity_tag',
      isMulti: false,
      label: t('asset:columns.entity_tag'),
      placeholder: t('asset:columns.entity_tag'),
      className: '',
      defaultValue: null,
      loadOptions: loadEntityTags,
      additional: { page: 1 },
    },
    {
      id: 'asset__filter__temperature',
      type: 'select',
      name: 'temp_logger',
      isMulti: false,
      label: t('asset:columns.temperature_filter'),
      placeholder: t('asset:columns.temperature_filter'),
      options: tempLoaggerOptions(t),
      className: '',
      defaultValue: null,
    },
    {
      id: 'asset__list__asset__model',
      type: 'select-async-paginate',
      name: 'model_id',
      isMulti: false,
      label: t('asset:columns.asset_model'),
      placeholder: t('asset:columns.asset_model'),
      className: '',
      defaultValue: null,
      loadOptions: loadAssetModel,
      additional: { page: 1 },
    },
  ]
}

export default {}
