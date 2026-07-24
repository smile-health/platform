import { useMemo, useRef } from 'react'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from '#components/accordion'
import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import {
  orderDetailCapacityProjectionStatusEnum,
  orderDetailCapacityProjectionTitleMap,
} from '../../order-detail.constant'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailBox } from '../OrderDetailBox'

export const OrderDetailCapacityProjection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const { data, orderItemProjectionCapacities } = useOrderDetailStore()

  const sortedCapacityProjectionData = useMemo(() => {
    const opcData = orderItemProjectionCapacities?.sort(
      (a, b) => b?.is_confirm - a?.is_confirm
    )
    return opcData?.filter(
      (item) =>
        item?.is_confirm !== orderDetailCapacityProjectionStatusEnum.Allocated
    )
  }, [orderItemProjectionCapacities])

  return (
    <OrderDetailBox
      ref={containerRef}
      title={
        <div className="ui-flex ui-flex-col ui-justify-between ui-items-start">
          <h5 className="ui-font-semibold">
            {t('orderDetail:capacity_projection.title')}
          </h5>
          <h6 className="ui-font-normal ui-text-gray-500">
            {t('common:at')} {data?.customer?.name || ''}
          </h6>
        </div>
      }
      className="ui-space-y-4"
    >
      <div className="ui-space-x-4">
        <AccordionRoot
          className="!ui-p-0"
          type="multiple"
          defaultValue={['capacity-projection-0']}
        >
          {sortedCapacityProjectionData?.map((data, index) => {
            return (
              <div
                key={data?.is_confirm}
                className={cx(
                  'ui-rounded-md ui-font-semibold ui-border !ui-mt-4 !ui-mx-0',
                  {
                    'ui-border-secondary-700 ui-text-secondary-700 ui-bg-secondary-50':
                      index === 0,
                  }
                )}
              >
                <AccordionItem
                  value={`capacity-projection-${index}`}
                  className="ui-border-none"
                >
                  <AccordionTrigger className="ui-px-3 ui-text-dark-blue ui-font-bold focus:!ui-border-none !ui-ring-transparent hover:ui-bg-transparent">
                    {t(
                      `orderDetail:capacity_projection.${orderDetailCapacityProjectionTitleMap[data?.is_confirm as keyof typeof orderDetailCapacityProjectionTitleMap]}` as any
                    )}
                  </AccordionTrigger>
                  <AccordionContent className="ui-pt-0">
                    <div className="ui-flex ui-justify-between">
                      <div>
                        <p className="ui-text-sm ui-font-medium ui-text-gray-500">
                          {t(
                            'orderDetail:capacity_projection.projection_of_total_stock_volume'
                          )}
                          :
                        </p>
                        <p className="ui-font-bold">
                          {numberFormatter(
                            data?.total_volume || 0,
                            i18n.language,
                            'decimal'
                          )}
                        </p>
                      </div>
                      <div className="ui-border-r ui-border-gray-200"></div>
                      <div>
                        <p className="ui-text-sm ui-font-medium ui-text-gray-500">
                          {t(
                            'orderDetail:capacity_projection.storage_net_capacity'
                          )}
                          :
                        </p>
                        <p className="ui-font-bold">
                          {numberFormatter(
                            data?.capacity_asset || 0,
                            i18n.language,
                            'decimal'
                          )}
                        </p>
                      </div>
                      <div className="ui-border-r ui-border-gray-200"></div>
                      <div>
                        <p className="ui-text-sm ui-font-medium ui-text-gray-500">
                          {t(
                            'orderDetail:capacity_projection.projection_of_percentage_used'
                          )}
                          :
                        </p>
                        <p className="ui-font-bold">
                          {numberFormatter(
                            data?.percent_capacity || 0,
                            i18n.language,
                            'decimal'
                          )}{' '}
                          %
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </div>
            )
          })}
        </AccordionRoot>
      </div>
    </OrderDetailBox>
  )
}
