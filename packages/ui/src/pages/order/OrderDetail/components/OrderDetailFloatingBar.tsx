import { useParams } from 'next/navigation'
import { Button, ButtonProps } from '#components/button'
import { USER_ROLE } from '#constants/roles'
import { useProgram } from '#hooks/program/useProgram'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import { hasPermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import { OrderStatusEnum } from '../../order.constant'
import useOrderDetailStore from '../order-detail.store'

type OrderDetailFloatingBarButton = Pick<
  ButtonProps,
  'onClick' | 'variant' | 'className'
> & {
  label: string
  isShow: boolean
}

const { Draft, Confirmed, Pending, Allocated, Shipped } = OrderStatusEnum

export const OrderDetailFloatingBar = () => {
  const router = useSmileRouter()
  const params = useParams()

  const orderId = params.id as string

  const { t } = useTranslation('orderDetail')

  const isPermitted = hasPermission('order-mutate')
  const userData = getUserStorage()
  const isSuperAdmin =
    userData?.role === USER_ROLE.SUPERADMIN ||
    userData?.role === USER_ROLE.ADMIN
  const { activeProgram } = useProgram()
  const userEntity = userData?.programs?.find(
    (data) => data?.id === activeProgram?.id
  )?.entity_id
  const isHierarchyEnabled =
    activeProgram?.config?.material?.is_hierarchy_enabled

  const {
    data,
    isShowFloatingBar,
    setOpenCancelForm,
    setOpenValidateDrawerForm,
    setOpenConfirmDrawerForm,
    setOpenAllocateDrawerForm,
    setOpenCancelConfirmationForm,
    setOpenShipForm,
    isThirdPartyOrder,
    isCustomer,
    isVendor,
    isOrderDetailHierarchy,
  } = useOrderDetailStore()

  const buttons: OrderDetailFloatingBarButton[] = [
    {
      label: t('button.cancel_order'),
      onClick: () => setOpenCancelForm(true),
      isShow:
        (isPermitted && isCustomer && data?.status === Pending) ||
        (isPermitted &&
          isVendor &&
          [Draft, Pending, Confirmed, Allocated]?.includes(
            data?.status as OrderStatusEnum
          )) ||
        isSuperAdmin,
      variant: 'outline',
    },
    {
      label: t('button.validate'),
      onClick: () => setOpenValidateDrawerForm(true),
      isShow:
        ((isPermitted && isCustomer) || isSuperAdmin) && data?.status === Draft,
    },
    {
      label: t('button.cancel_confirmation'),
      onClick: () => setOpenCancelConfirmationForm(true),
      isShow:
        ((isPermitted && isVendor) || isSuperAdmin) &&
        data?.status === Confirmed &&
        !isThirdPartyOrder,
      variant: 'outline',
    },
    {
      label: t('button.confirm_order'),
      onClick: () => setOpenConfirmDrawerForm(true),
      isShow:
        ((isPermitted && isVendor) || isSuperAdmin) &&
        data?.status === Pending &&
        !isThirdPartyOrder,
    },
    {
      label: t('button.allocate'),
      onClick: () =>
        isHierarchyEnabled && isOrderDetailHierarchy
          ? router.push(`/v5/order/${orderId}/allocate`)
          : setOpenAllocateDrawerForm(true),
      isShow:
        ((isPermitted && isVendor) || isSuperAdmin) &&
        data?.status === Confirmed,
    },
    {
      label: t('button.ship_order'),
      onClick: () => setOpenShipForm(true),
      isShow:
        ((isPermitted && isVendor) || isSuperAdmin) &&
        data?.status === Allocated,
    },
    {
      label: t('button.receive_order'),
      onClick: () => router.push(`/v5/order/${orderId}/receive`),
      isShow:
        ((isPermitted && isCustomer) || isSuperAdmin) &&
        data?.status === Shipped,
    },
  ]

  return (
    <div
      className={cx(
        'ui-fixed ui-bottom-0 ui-left-0 ui-w-full ui-shadow-lg ui-bg-white ui-border-t ui-transition-all ui-transform',
        {
          'ui-translate-y-full': !isShowFloatingBar,
          'ui-translate-y-0': isShowFloatingBar,
        }
      )}
    >
      <div className="ui-container ui-mx-auto ui-flex ui-justify-end ui-items-center ui-py-4 ui-px-6 ui-gap-3">
        {hasPermission('order-mutate') &&
          buttons
            .filter((button) => button.isShow)
            .map((button) => (
              <Button
                key={button.label}
                className="ui-min-w-[200px]"
                variant={button.variant}
                onClick={button.onClick}
              >
                {button.label}
              </Button>
            ))}
      </div>
    </div>
  )
}
