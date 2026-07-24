import { useProgram } from '#hooks/program/useProgram'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import { TFunction } from 'i18next'

export const orderCreationList = (
  t: TFunction<'orderList'>,
  getLink: (url: string) => string
) => {
  const user = getUserStorage()
  const { activeProgram } = useProgram()

  const isShowCentral =
    hasPermission('order-central-mutate') ||
    (hasPermission('order-manufacturer-central-mutate') &&
      user?.manufacture?.type === 1)

  const isShowCreateRegularOrder =
    hasPermission('order-mutate') &&
    !activeProgram?.config?.order?.is_create_restricted

  return [
    {
      id: 'btn-order-create',
      label: t('create.order'),
      href: getLink('/v5/order/create'),
      isShow: isShowCreateRegularOrder,
    },
    {
      id: 'btn-allocation-create',
      label: t('create.distribution'),
      href: getLink('/v5/order/create-distribution'),
      isShow: hasPermission('order-mutate'),
    },
    {
      id: 'btn-return-create',
      label: t('create.return'),
      href: getLink('/v5/order/create-return'),
      isShow: hasPermission('order-mutate'),
    },
    {
      id: 'btn-central-deliver',
      label: t('create.central'),
      href: getLink('/v5/order/create-central-distribution'),
      isShow: isShowCentral,
    },
    {
      id: 'btn-relocation-create',
      label: t('create.relocation'),
      href: getLink('/v5/order/create-relocation'),
      isShow: hasPermission('order-mutate'),
    },
  ]
}

export const orderListTabs = (
  t: TFunction<'orderList'>,
  getLink: (url: string) => string,
  isCursor = false
) => [
  {
    id: `tab-order-list-all${isCursor ? '-cursor' : ''}`,
    label: t('tab.all'),
    href: getLink(`/v5/order${isCursor ? '/cursor' : ''}/all`),
    isShow: hasPermission('order-list-all'),
  },
  {
    id: `tab-order-list-vendor${isCursor ? '-cursor' : ''}`,
    label: t('tab.vendor'),
    href: getLink(`/v5/order${isCursor ? '/cursor' : ''}/vendor`),
    isShow: true,
  },
  {
    id: `tab-order-list-customer${isCursor ? '-cursor' : ''}`,
    label: t('tab.customer'),
    href: getLink(`/v5/order${isCursor ? '/cursor' : ''}/customer`),
    isShow: true,
  },
]
