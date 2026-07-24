import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { useTranslation } from 'react-i18next'

import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailBox } from '../OrderDetailBox'

export const OrderDetailVendor = () => {
  const { t } = useTranslation('orderDetail')
  const { data } = useOrderDetailStore()

  return (
    <OrderDetailBox title={t('vendor.title')}>
      <RenderDetailValue
        showColon={false}
        className="ui-grid-cols-[200px_1fr]"
        loading={!data}
        data={[
          { label: `${t('data.vendor_name')} :`, value: data?.vendor?.name },
          {
            label: `${t('data.address')} :`,
            value: data?.vendor?.address,
          },
        ]}
      />
    </OrderDetailBox>
  )
}
