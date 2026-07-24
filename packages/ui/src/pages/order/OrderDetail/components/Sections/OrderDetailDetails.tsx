import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { OrderTypeEnum } from '../../../order.constant'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailBox } from '../OrderDetailBox'

const { Request, Distribution, Return, CentralDistribution, Relocation } =
  OrderTypeEnum

export const OrderDetailDetails = () => {
  const { t } = useTranslation('orderDetail')
  const { data, isLoading } = useOrderDetailStore()

  const getOrderNumberLabel = () => {
    return {
      [Request]: t('data.request_number'),
      [Distribution]: t('data.distribution_number'),
      [Return]: t('data.return_number'),
      [CentralDistribution]: t('data.central_distribution_number'),
      [Relocation]: t('data.relocation_number'),
    }[data?.type ?? Request]
  }

  return (
    <OrderDetailBox title={t('details.title')} className="ui-space-y-6">
      <div className="ui-grid ui-grid-cols-2 ui-gap-4">
        <RenderDetailValue
          className="ui-grid-cols-[200px_1px_1fr] ui-auto-rows-min ui-border ui-rounded ui-p-4 ui-text-sm ui-gap-2 ui-place-items-start"
          valuesClassName="ui-text-dark-blue ui-font-semibold ui-min-h-6"
          loading={isLoading || !data}
          data={[
            { label: t('data.delivery_number'), value: data?.delivery_number },
            {
              label: getOrderNumberLabel(),
              value: data?.id,
            },
            { label: t('data.activity'), value: data?.activity?.name },
            { label: t('data.delivery_type'), value: data?.delivery_type },
            { label: t('data.contract_number'), value: data?.po_no ?? '-' },
          ]}
        />
        <RenderDetailValue
          className="ui-grid-cols-[200px_1px_1fr] ui-auto-rows-min ui-border ui-rounded ui-p-4 ui-text-sm ui-gap-2 ui-place-items-start"
          valuesClassName="ui-text-dark-blue ui-font-semibold ui-min-h-6"
          loading={isLoading || !data}
          data={[
            {
              label: t('data.created_by'),
              value: getFullName(
                data?.user_created_by?.firstname,
                data?.user_created_by?.lastname
              ),
            },
            {
              label: t('data.created_at'),
              value:
                data?.created_at &&
                dayjs(data.created_at).format('DD MMM YYYY HH:mm'),
            },
            {
              label: t('data.actual_shipment_date'),
              value:
                data?.actual_shipment_date &&
                dayjs(data.actual_shipment_date).format('DD MMM YYYY'),
            },
            {
              label: t('data.actual_receipt_date'),
              value:
                data?.fulfilled_at &&
                dayjs(data.fulfilled_at).format('DD MMM YYYY'),
            },
          ]}
        />
      </div>
    </OrderDetailBox>
  )
}
