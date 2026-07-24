import { useState } from 'react'
import { Button } from '#components/button'
import { Skeleton } from '#components/skeleton'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useOrderDetailHistory } from '../hooks/useOrderDetailHistory'
import { OrderDetailInteroperabilityLogs } from '../order-detail.type'
import { OrderDetailHistoryModal } from './Modals/OrderDetailHistoryModal'
import { OrderDetailBox } from './OrderDetailBox'

export const OrderDetailHistory = () => {
  const { t } = useTranslation(['common', 'orderDetail'])

  const orderDetailHistory = useOrderDetailHistory()

  const [selectedHistory, setSelectedHistory] =
    useState<OrderDetailInteroperabilityLogs>()

  return (
    <>
      <OrderDetailHistoryModal
        data={selectedHistory}
        isOpen={Boolean(selectedHistory)}
        onClose={() => setSelectedHistory(undefined)}
      />
      <OrderDetailBox
        title={t('orderDetail:history.title')}
        enableShowHide
        className="ui-space-y-6"
      >
        {orderDetailHistory.isLoading && <OrderDetailHistorySkeleton />}
        {!orderDetailHistory.isLoading && (
          <div className="ui-space-y-4 ">
            {orderDetailHistory.data?.data.map((history, index) => (
              <>
                <div className="ui-flex ui-items-center ui-justify-between">
                  <div className="space-y-1">
                    <div className="ui-text-primary-500">{history.action}</div>
                    <div className="ui-text-gray-500">
                      {history.created_at
                        ? dayjs(history.created_at).format('DD MMMM YYYY HH:mm')
                        : '-'}{' '}
                      {t('common:by')} {history.source}
                    </div>
                  </div>
                  <div>
                    <Button
                      color="primary"
                      variant="subtle"
                      type="button"
                      onClick={() => setSelectedHistory(history)}
                    >
                      {t('common:details')}
                    </Button>
                  </div>
                </div>
                {orderDetailHistory.data?.data.length !== index + 1 && (
                  <hr className="ui-h-0.5 ui-my-12 ui-border-t-0 ui-bg-gray-100" />
                )}
              </>
            ))}
          </div>
        )}
      </OrderDetailBox>
    </>
  )
}

export const OrderDetailHistorySkeleton = () => {
  return (
    <div className="ui-space-y-4">
      <Skeleton className="ui-h-14" />
      <Skeleton className="ui-h-14" />
      <Skeleton className="ui-h-14" />
    </div>
  )
}
