import { parseDate } from '@internationalized/date'
import { UseFilter } from '#components/filter'
import { OptionType } from '#components/react-select'
import {
  orderIntegrationTypeList,
  orderStatusList,
  orderTypeList,
} from '#constants/order'
import { ProgramEnum } from '#constants/program'
import { USER_ROLE } from '#constants/roles'
import { loadActivityOptions } from '#services/activity'
import { loadEntities, loadEntityTags } from '#services/entity'
import { loadProvinces, loadRegencies } from '#services/location'
import { hasPermission } from '#shared/permission/index'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { getDefaultImmunizationActivities } from '../../../dashboard/dashboard.constant'
import { listOrderDeliveryTypes } from '../../order.service'

export default function orderListFilterFormSchema(
  t: TFunction<['common', 'order', 'orderList']>,
  tDashboard: TFunction<'dashboard'>,
  type: 'all' | 'vendor' | 'customer'
) {
  const user = getUserStorage()
  const program = getProgramStorage()
  const userProgramEntityId = program?.entity_id
  const entityType = user?.entity?.type
  const manufactureType = user?.manufacture?.type
  const isProvinceType = entityType === 1
  const isDistrictType = entityType === 2
  const isManufactureType = manufactureType === 1

  const isSuperAdmin = [USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(
    user?.role as USER_ROLE
  )

  const isAllowEntityType1 = hasPermission('order-list-filter-entity-type-1')
  const isAllowEntityType2 = hasPermission('order-list-filter-entity-type-2')

  const isAllowDistrictFilter = isAllowEntityType2 || isProvinceType

  const userProvince =
    isSuperAdmin || isManufactureType
      ? null
      : ({
          label: user?.entity?.province?.name as string,
          value: user?.entity?.province?.id,
        } as OptionType)
  const isDistrictUser = !isSuperAdmin && !isManufactureType && isDistrictType
  const userRegency = isDistrictUser
    ? ({
        label: user?.entity?.regency?.name as string,
        value: user?.entity?.regency?.id,
      } as OptionType)
    : null

  const defaultActivities =
    program?.key === ProgramEnum.Immunization
      ? getDefaultImmunizationActivities(tDashboard)[0]
      : null

  const schema = [
    {
      id: 'select-activity',
      type: 'select-async-paginate',
      name: 'activity',
      label: t('orderList:form.activity.label'),
      placeholder: t('orderList:form.activity.placeholder'),
      loadOptions: loadActivityOptions,
      additional: { page: 1 },
      defaultValue: defaultActivities,
    },
    {
      id: 'date-range-order-list',
      type: 'date-range-picker',
      name: 'date_range',
      withPreset: true,
      multicalendar: true,
      label: t('orderList:form.date_range.label'),
      className: '',
      maxValue: parseDate(
        dayjs(new Date()).add(1, 'day').format('YYYY-MM-DD')
      ).toString(),
      defaultValue: {
        start: dayjs().subtract(7, 'day').toISOString(),
        end: dayjs().toISOString(),
      },
    },
    {
      id: 'input-order-number',
      type: 'text',
      name: 'order_number',
      label: t('orderList:form.order_number.label'),
      placeholder: t('orderList:form.order_number.placeholder'),
      defaultValue: '',
    },
    {
      id: 'select-status',
      type: 'select',
      name: 'status',
      label: t('orderList:form.status.label'),
      placeholder: t('orderList:form.status.placeholder'),
      options: orderStatusList(t),
      defaultValue: null,
    },
    {
      id: 'select-delivery-type',
      type: 'select',
      name: 'delivery_type',
      label: t('orderList:form.delivery.label'),
      placeholder: t('orderList:form.delivery.placeholder'),
      loadOptions: async () => {
        const result = await listOrderDeliveryTypes()
        return result?.data?.map((item) => {
          return {
            value: item?.id,
            label: item?.name,
          }
        })
      },
      defaultValue: null,
    },
    {
      id: 'select-type',
      type: 'select',
      name: 'type',
      label: t('orderList:form.type.label'),
      placeholder: t('orderList:form.type.placeholder'),
      options: orderTypeList(t),
      defaultValue: null,
    },
    {
      id: 'select-integration-type',
      type: 'select',
      name: 'integration_type',
      label: t('orderList:form.integration_type.label'),
      hidden: isManufactureType,
      placeholder: t('orderList:form.integration_type.placeholder'),
      options: orderIntegrationTypeList(t).filter(
        (integrationType) =>
          !integrationType.programKey ||
          program.key === integrationType.programKey
      ),
      defaultValue: null,
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entity_tag',
      label: t('orderList:form.entity_tag.label'),
      placeholder: t('orderList:form.entity_tag.placeholder'),
      loadOptions: loadEntityTags,
      hidden: isManufactureType || type === 'all',
      additional: { page: 1, isGlobal: false },
      defaultValue: null,
    },
    {
      id: 'select-primary-vendor',
      type: 'select-async-paginate',
      name: 'primary_vendor',
      label: t('orderList:form.primary.vendor.label'),
      placeholder: t('orderList:form.primary.vendor.placeholder'),
      hidden: !isAllowEntityType1 || type === 'all',
      loadOptions: loadEntities,
      clearOnChangeFields: isSuperAdmin
        ? ['province', 'district', 'primary_health_care']
        : ['primary_health_care'],
      additional: { page: 1, type_ids: 5 },
      defaultValue: null,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'province',
      label: t('orderList:form.province.label'),
      placeholder: t('orderList:form.province.placeholder'),
      loadOptions: loadProvinces,
      disabled: !isSuperAdmin,
      hidden: !isAllowEntityType1 || type === 'all',
      defaultValue: userProvince,
      clearOnChangeFields: [
        'primary_vendor',
        'district',
        'primary_health_care',
      ],
      additional: {
        page: 1,
        type_ids: 1,
        ...(isSuperAdmin && {
          is_vendor: 1,
          status: 1,
        }),
      },
    },
    {
      id: 'select-district',
      type: 'select-async-paginate',
      name: 'district',
      label: t('orderList:form.district.label'),
      placeholder: t('orderList:form.district.placeholder'),
      loadOptions: loadRegencies,
      clearOnChangeFields: ['primary_health_care'],
      hidden: !isAllowDistrictFilter || type === 'all',
      defaultValue: userRegency,
      disabled: ({ getReactSelectValue }) => {
        const province = getReactSelectValue('province')
        if (isSuperAdmin) {
          return !province
        }
        if (isAllowEntityType1) {
          return (!province || !isSuperAdmin) && Boolean(userRegency?.value)
        }
        return !isAllowDistrictFilter || !isSuperAdmin
      },
      additional: ({ getReactSelectValue }) => {
        return {
          parent_id: isAllowEntityType1
            ? getReactSelectValue('province')
            : userProgramEntityId,
          page: 1,
          is_consumption: 0,
          ...(isSuperAdmin && {
            is_vendor: 1,
            status: 1,
          }),
        }
      },
    },
    {
      id: 'select-primary-health-care',
      type: 'select-async-paginate',
      name: 'primary_health_care',
      label: t('orderList:form.primary.health_care.label'),
      clearOnChangeFields: ['primary_vendor'],
      placeholder: t('orderList:form.primary.health_care.placeholder'),
      loadOptions: loadEntities,
      hidden: isManufactureType || type === 'all',
      defaultValue: null,
      disabled: ({ getReactSelectValue }) => {
        const district = getReactSelectValue('district')
        return isAllowDistrictFilter ? !district : !isDistrictType
      },
      additional: ({ getReactSelectValue }) => {
        const district = getReactSelectValue('district')
        const province = getReactSelectValue('province')
        return {
          province_ids: province?.toString(),
          regency_ids: district?.toString(),
          page: 1,
          is_consumption: 0,
          status: 1,
          is_vendor: 1,
        }
      },
    },
  ] satisfies UseFilter

  return schema
}
