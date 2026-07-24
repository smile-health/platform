import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { OrderDetailBox, OrderDetailStatusPipeline } from '../'
import { useDownloadFile } from '../../hooks'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailCustomer } from './OrderDetailCustomer'
import { OrderDetailVendor } from './OrderDetailVendor'

export const OrderDetailStatus = () => {
  const params = useParams()

  const { t } = useTranslation('orderDetail')

  const { data } = useOrderDetailStore()

  const downloadButtons = useDownloadFile({
    id: params.id as string,
    status: data?.status,
    client_key: data?.metadata?.client_key,
  })

  return (
    <OrderDetailBox
      title={t('order_status.title')}
      className="ui-space-y-6"
      buttons={downloadButtons}
    >
      <OrderDetailStatusPipeline />

      <div className="ui-grid ui-grid-cols-2 ui-gap-6">
        <OrderDetailCustomer />
        <OrderDetailVendor />
      </div>
    </OrderDetailBox>
  )
}
