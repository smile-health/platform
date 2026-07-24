import { parseDate } from '@internationalized/date'
import { FilterFormSchema, UseFilter } from '#components/filter'
import { BOOLEAN } from '#constants/common'
import { ENTITY_TYPE } from '#constants/entity'
import { ProgramEnum } from '#constants/program'
import { loadActivityOptions } from '#services/activity'
import {
  loadEntities,
  loadEntityCustomerOptions,
  loadEntityTags,
} from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import {
  getMaterialLevels,
  loadMaterial,
  loadMaterialType,
} from '#services/material'
import { RequestloginResponse } from '#types/auth'
import { TProgram } from '#types/program'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { getDefaultImmunizationActivities } from '../../../dashboard/dashboard.constant'
import { loadReason, loadTransactionType } from '../../transaction.services'
import { filterOfUser } from './transaction-list.common'
import { MATERIAL_LEVEL, orderTypeOptions } from './transaction-list.constant'

type Params = {
  t: TFunction<['common', 'transactionList']>
  tDashboard: TFunction<'dashboard'>
  program?: TProgram
}

export const transactionFilterSchema = ({
  t,
  tDashboard,
  program,
}: Params): UseFilter => {
  const userEntity = getUserStorage()
  const { defaultProvince, defaultRegency } = filterOfUser(
    userEntity as RequestloginResponse
  )
  const isTransferStockRestricted =
    program?.config?.transaction?.is_transfer_stock_restricted ?? true

  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)[0]
      : null

  return [
    {
      id: 'transaction__list__activity_id',
      type: 'select-async-paginate',
      name: 'activity_id',
      isMulti: false,
      label: t('transactionList:filter.activity.label'),
      placeholder: t('transactionList:filter.activity.placeholder'),
      className: '',
      defaultValue: defaultActivities,
      clearOnChangeFields: ['material_id'],
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
    },
    {
      id: 'transaction__list__material_type_id',
      type: 'select-async-paginate',
      name: 'material_type_id',
      isMulti: false,
      label: t('transactionList:filter.material_type.label'),
      placeholder: t('transactionList:filter.material_type.placeholder'),
      className: '',
      defaultValue: null,
      clearOnChangeFields: ['material_id'],
      loadOptions: loadMaterialType,
      additional: { page: 1 },
    },
    {
      id: 'transaction__list__kfa_level',
      type: 'select',
      name: 'material_level_id',
      isMulti: false,
      isClearable: false,
      hidden: !program?.config?.material?.is_hierarchy_enabled,
      required: program?.config?.material?.is_hierarchy_enabled,
      label: t('transactionList:filter.material_kfa_level.label'),
      placeholder: t('transactionList:filter.material_kfa_level.placeholder'),
      clearOnChangeFields: ['material_id'],
      loadOptions: async () => {
        const response = await getMaterialLevels({
          page: 1,
          paginate: 50,
          enable_only: BOOLEAN.TRUE,
        })

        return response?.data?.map((item) => ({
          label: item?.name,
          value: item?.id,
        }))
      },
      defaultValue: {
        value: MATERIAL_LEVEL.TEMPLATE,
        label: t('transactionList:others.active_substance_and_strength'),
      },
    },
    {
      id: 'transaction__list__material_id',
      type: 'select-async-paginate',
      name: 'material_id',
      isMulti: false,
      label: t('transactionList:filter.material.label'),
      placeholder: t('transactionList:filter.material.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadMaterial,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        program_id: program?.id,
        is_with_activities: true,
        material_type_ids:
          getReactSelectValue('material_type_id')?.toString() ?? null,
        material_activities:
          getReactSelectValue('activity_id')?.toString() ?? null,
        material_level_id: program?.config?.material?.is_hierarchy_enabled
          ? (getReactSelectValue('material_level_id') ?? null)
          : null,
      }),
    },
    {
      id: 'transaction__list__date_range',
      type: 'date-range-picker',
      name: 'date_range',
      label: t('common:form.date_range.label'),
      withPreset: true,
      multicalendar: true,
      maxValue: parseDate(
        dayjs(new Date()).add(1, 'day').format('YYYY-MM-DD')
      ).toString(),
      className: '',
      defaultValue: {
        start: dayjs().toISOString(),
        end: dayjs().toISOString(),
      },
    },
    {
      id: 'transaction__list__transaction_type_id',
      type: 'select-async-paginate',
      name: 'transaction_type_id',
      isMulti: false,
      label: t('transactionList:filter.transaction_type.label'),
      placeholder: t('transactionList:filter.transaction_type.placeholder'),
      className: '',
      defaultValue: null,
      clearOnChangeFields: ['transaction_reason_id'],
      loadOptions: loadTransactionType,
      additional: { page: 1, isTransferStockRestricted },
    },
    {
      id: 'transaction__list__transaction_reason_id',
      type: 'select-async-paginate',
      name: 'transaction_reason_id',
      isMulti: false,
      label: t('transactionList:filter.reason.label'),
      placeholder: t('transactionList:filter.reason.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadReason,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        transaction_type_id: getReactSelectValue('transaction_type_id') ?? null,
      }),
    },
    {
      id: 'transaction__list__is_order',
      type: 'switch',
      name: 'is_order',
      label: t('transactionList:filter.has_order.label'),
      className: '',
      yesLabel: '',
      noLabel: '',
      size: 'lg',
      labelInside: {
        on: t('common:yes'),
        off: t('common:no'),
      },
      callBack: ({ setValue, value }) =>
        setValue(
          'is_order',
          value === BOOLEAN.FALSE ? BOOLEAN.TRUE : BOOLEAN.FALSE
        ),
    },
    {
      id: 'transaction__list__order_type',
      type: 'select',
      name: 'order_type',
      isMulti: false,
      label: t('transactionList:filter.order_type.label'),
      placeholder: t('transactionList:filter.order_type.placeholder'),
      className: '',
      defaultValue: null,
      options: orderTypeOptions(t),
    },
    {
      id: 'transaction__list__entity_tag_id',
      type: 'select-async-paginate',
      name: 'entity_tag_id',
      isMulti: false,
      label: t('transactionList:filter.entity_tag.label'),
      placeholder: t('transactionList:filter.entity_tag.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: loadEntityTags,
      additional: { page: 1 },
    },
    {
      id: 'transaction__list__entity_user_id',
      type: 'select-async-paginate',
      name: 'entity_user_id',
      isMulti: false,
      label: t('transactionList:filter.primary_vendor.label'),
      placeholder: t('transactionList:filter.primary_vendor.placeholder'),
      clearOnChangeFields: ['entity_id', 'entity_for_consumption'],
      loadOptions: loadEntities,
      additional: {
        page: 1,
        type_ids: ENTITY_TYPE.PRIMARY_VENDOR.toString(),
      },
      defaultValue: null,
    },
    {
      id: 'transaction__list__province_id',
      type: 'select-async-paginate',
      name: 'province_id',
      isMulti: false,
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: !!defaultProvince,
      clearOnChangeFields: [
        'regency_id',
        'entity_id',
        'entity_for_consumption',
      ],
      additional: { page: 1 },
      defaultValue: defaultProvince,
    } as FilterFormSchema,
    {
      id: 'transaction__list__regency_id',
      type: 'select-async-paginate',
      name: 'regency_id',
      isMulti: false,
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('province_id') || !!defaultRegency,
      clearOnChangeFields: ['entity_id', 'entity_for_consumption'],
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('province_id') && {
          parent_id: getReactSelectValue('province_id'),
        }),
      }),
      defaultValue: defaultRegency,
    },
    {
      id: 'transaction__list__entity_id',
      type: 'select-async-paginate',
      name: 'entity_id',
      isMulti: false,
      label: t('transactionList:filter.integrated_healthcare.label'),
      placeholder: t(
        'transactionList:filter.integrated_healthcare.placeholder'
      ),
      loadOptions: loadEntities,
      clearOnChangeFields: ['entity_for_consumption', 'entity_user_id'],
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
      id: 'transaction__list__customer_tag_id',
      type: 'select-async-paginate',
      name: 'customer_tag_id',
      isMulti: false,
      label: t('transactionList:filter.consumption_customer_tag.label'),
      placeholder: t(
        'transactionList:filter.consumption_customer_tag.placeholder'
      ),
      loadOptions: loadEntityTags,
      additional: () => ({
        page: 1,
      }),
      defaultValue: null,
    },
    {
      id: 'transaction__list__entity_for_consumption',
      type: 'select-async-paginate',
      name: 'entity_for_consumption',
      isMulti: false,
      label: t('transactionList:filter.consumption_customer.label'),
      placeholder: t('transactionList:filter.consumption_customer.placeholder'),
      loadOptions: loadEntityCustomerOptions,
      disabled: ({ getReactSelectValue }) => !getReactSelectValue('entity_id'),
      clearOnChangeFields: ['entity_user_id'],
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        is_consumption: BOOLEAN.TRUE,
        is_for_create: false,
        id: getReactSelectValue('entity_id')?.toString() ?? null,
      }),
      defaultValue: null,
    },
  ]
}

export default {}
