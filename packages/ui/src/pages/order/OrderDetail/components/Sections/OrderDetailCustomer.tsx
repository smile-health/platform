import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailBox } from '../OrderDetailBox'

export const OrderDetailCustomer = () => {
  const { t } = useTranslation('orderDetail')
  const { data } = useOrderDetailStore()

  return (
    <OrderDetailBox title={t('customer.title')}>
      <RenderDetailValue
        showColon={false}
        className="ui-grid-cols-[200px_1fr]"
        loading={!data}
        data={[
          {
            label: t('data.customer_name'),
            value: data?.customer?.name,
          },
          {
            label: t('data.address'),
            value: data?.customer?.address,
          },
          {
            label: t('data.required_by_date'),
            value:
              data?.required_date &&
              dayjs(data?.required_date).format('DD MMM YYYY'),
            valueClassName: 'ui-uppercase',
          },
        ]}
      />
    </OrderDetailBox>
  )
}
