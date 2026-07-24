import { useEffect, useRef } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import { useProgram } from '#hooks/program/useProgram'
import { useIntersectionObserver } from '#hooks/useIntersectionObserver'
import { useTranslation } from 'react-i18next'

import { OrderStatusEnum } from '../../../order.constant'
import { OrderDetailBox } from '../../components/OrderDetailBox'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailHierarchyItemsTable } from '../Tables/OrderDetailHierarchyItemsTable'
import { OrderDetailItemsTable } from '../Tables/OrderDetailItemsTable'

const { Pending } = OrderStatusEnum

export const OrderDetailItems = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation(['common', 'orderDetail'])
  const { activeProgram } = useProgram()
  const isHierarchyEnabled =
    activeProgram?.config?.material?.is_hierarchy_enabled

  const observed = useIntersectionObserver({
    ref: containerRef,
    options: { threshold: 1 },
  })

  const {
    data,
    setShowFloatingBar,
    setOpenItemForm,
    isVendor,
    isThirdPartyOrder,
    isOrderDetailHierarchy,
  } = useOrderDetailStore()

  useEffect(() => {
    if (containerRef.current) {
      document.onscroll = () => {
        if (containerRef.current?.offsetTop) {
          const offsetTopVisibility = containerRef.current.offsetTop - 275
          const isVisible = window.scrollY >= offsetTopVisibility || observed
          setShowFloatingBar(isVisible)
        }
      }
    }
  }, [containerRef, observed])

  return (
    <OrderDetailBox
      ref={containerRef}
      title={
        data?.order_items?.length ? `Item (${data.order_items.length})` : 'Item'
      }
      className="ui-space-y-4"
    >
      {isHierarchyEnabled && isOrderDetailHierarchy ? (
        <OrderDetailHierarchyItemsTable />
      ) : (
        <OrderDetailItemsTable />
      )}

      {data?.status === Pending && !isVendor && !isThirdPartyOrder && (
        <div className="ui-flex gap-2">
          <Button
            size="sm"
            leftIcon={<PlusIcon className="ui-w-5 ui-text-dark-blue" />}
            variant="outline"
            onClick={() => setOpenItemForm(true, 'add')}
          >
            {t('common:add_item')}
          </Button>
        </div>
      )}
    </OrderDetailBox>
  )
}
