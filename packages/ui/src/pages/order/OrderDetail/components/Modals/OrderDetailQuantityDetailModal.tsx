import { useState } from 'react'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import i18n from '../../../../../locales/i18n'
import { orderStatusType, OrderTypeEnum } from '../../../order.constant'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailChildren, OrderDetailStock } from '../../order-detail.type'
import { OrderDetailModal } from '../OrderDetailModal'

type OrderDetailQuantityDetailModalProps = {
  isHierarchyEnabled?: boolean
}

export const OrderDetailQuantityDetailModal = ({
  isHierarchyEnabled = false,
}: OrderDetailQuantityDetailModalProps) => {
  const { t } = useTranslation(['common', 'orderDetail'])
  const {
    data: orderDetailData,
    selectedOrderItemData: orderItemData,
    isOpenQuantityDetailModal,
    setOpenQuantityDetailModal,
    isOrderDetailHierarchy,
  } = useOrderDetailStore()
  const [isBatchOpened, setIsBatchOpened] = useState<number | undefined>(
    undefined
  )
  const handleClose = () => setOpenQuantityDetailModal(false)
  const handleOpenBatch = (id?: number) => {
    setIsBatchOpened((prev) => (prev === id ? undefined : id))
  }

  return (
    <OrderDetailModal
      size="xl"
      title={t(
        isHierarchyEnabled && isOrderDetailHierarchy
          ? 'orderDetail:modal.quantity_detail.title_hierarchy'
          : 'orderDetail:modal.quantity_detail.title'
      )}
      open={isOpenQuantityDetailModal}
      onClose={handleClose}
      cancelButton={{
        label: t('common:close'),
        className: 'ui-w-full',
      }}
    >
      <div className="ui-space-y-4 ui-text-dark-blue">
        {orderItemData?.[
          isHierarchyEnabled && isOrderDetailHierarchy
            ? 'children'
            : 'order_stocks'
        ]?.map((data) => {
          const children = data as OrderDetailChildren
          const stock = data as OrderDetailStock
          return (
            <div
              key={
                isHierarchyEnabled && isOrderDetailHierarchy
                  ? children?.material?.id
                  : stock?.id
              }
            >
              {!isHierarchyEnabled &&
                isOrderDetailHierarchy &&
                'batch' in stock &&
                stock?.batch && (
                  <>
                    <div>
                      {t('orderDetail:data.batch_code')}: {stock?.batch?.code}
                    </div>
                    <div>
                      {t('orderDetail:data.expired_date')}:{' '}
                      {stock?.batch?.expired_date
                        ? dayjs(stock?.batch?.expired_date)
                            .format('DD MMM YYYY')
                            .toUpperCase()
                        : '-'}
                    </div>
                  </>
                )}
              {isHierarchyEnabled && isOrderDetailHierarchy ? (
                <div>
                  <p>{children?.material?.name}</p>
                  <div className="ui-font-semibold">
                    Qty:{' '}
                    {numberFormatter(
                      (children as any)?.[
                        `${orderStatusType('children', isOrderDetailHierarchy)?.[(orderDetailData?.status ?? 1) - 1]}_qty` as unknown as any
                      ],
                      i18n.language
                    )}
                  </div>
                </div>
              ) : (
                <div key={stock?.batch_id}>
                  <div>
                    {t('orderDetail:data.batch_code')}:{' '}
                    {stock?.batch?.code ?? '-'}
                  </div>
                  <div>
                    {t('orderDetail:data.expired_date')}:{' '}
                    {stock?.batch?.expired_date
                      ? dayjs(stock?.batch?.expired_date)
                          .format('DD MMM YYYY')
                          .toUpperCase()
                      : '-'}
                  </div>
                  <div>
                    {t('orderDetail:data.stock_from_activity')}:{' '}
                    {stock?.activity_name ?? '-'}
                  </div>
                  <div className="ui-font-semibold">
                    Qty:{' '}
                    {numberFormatter(
                      (stock as any)?.[
                        `${orderStatusType('batch', isOrderDetailHierarchy)?.[(orderDetailData?.status ?? 1) - 1]}_qty` as unknown as any
                      ],
                      i18n.language
                    )}
                  </div>
                </div>
              )}
              {Boolean(
                (children?.order_stocks?.length ||
                  orderItemData?.order_stocks?.length) &&
                  isOrderDetailHierarchy
              ) && (
                <div>
                  <button
                    className="ui-text-sm ui-my-4 !ui-outline-none"
                    onClick={() => handleOpenBatch(data?.id)}
                  >
                    {data?.id === isBatchOpened
                      ? t('orderDetail:modal.hierarchy.button.hide')
                      : t('orderDetail:modal.hierarchy.button.show')}
                  </button>
                  {isBatchOpened === data?.id && (
                    <div className="!ui-w-full">
                      {[
                        ...(isOrderDetailHierarchy
                          ? (children?.order_stocks ?? [])
                          : (orderItemData?.order_stocks ?? [])),
                      ]?.map((stock) => {
                        return (
                          <div
                            className="!ui-bg-[#F1F5F9] !ui-w-full !ui-p-4 !ui-mb-4"
                            key={stock?.batch_id}
                          >
                            <div>
                              {t('orderDetail:data.batch_code')}:{' '}
                              {stock?.batch?.code ?? '-'}
                            </div>
                            <div>
                              {t('orderDetail:data.expired_date')}:{' '}
                              {stock?.batch?.expired_date
                                ? dayjs(stock?.batch?.expired_date)
                                    .format('DD MMM YYYY')
                                    .toUpperCase()
                                : '-'}
                            </div>
                            <div>
                              {t('orderDetail:data.stock_from_activity')}:{' '}
                              {stock?.activity_name ?? '-'}
                            </div>
                            <div className="ui-font-semibold">
                              Qty:{' '}
                              {numberFormatter(
                                (stock as any)?.[
                                  `${orderStatusType('batch', isOrderDetailHierarchy)?.[(orderDetailData?.status ?? 1) - 1]}_qty` as unknown as any
                                ],
                                i18n.language
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </OrderDetailModal>
  )
}
