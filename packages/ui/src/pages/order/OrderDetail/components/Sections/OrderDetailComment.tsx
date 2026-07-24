import { Skeleton } from '#components/skeleton'
import { useTranslation } from 'react-i18next'

import { OrderDetailBox, OrderDetailCommentItem } from '../'
import useOrderDetailStore from '../../order-detail.store'
import { OrderDetailCommentForm } from '../Forms/OrderDetailCommentForm'

export const OrderDetailComment = () => {
  const { t } = useTranslation('orderDetail')
  const { data, isLoading } = useOrderDetailStore()

  const title = data
    ? `${t('comment.title')} (${data.order_comments.length})`
    : t('comment.title')

  return (
    <OrderDetailBox title={title} enableShowHide className="ui-space-y-6">
      <OrderDetailCommentForm />

      {isLoading && <OrderDetailCommentItemSkeleton />}
      {!isLoading && data?.order_comments && data.order_comments.length > 0 && (
        <div className="ui-space-y-4">
          {data.order_comments.map((item) => (
            <OrderDetailCommentItem key={item.id} {...item} />
          ))}
        </div>
      )}
    </OrderDetailBox>
  )
}

const OrderDetailCommentItemSkeleton = () => (
  <div className="ui-space-y-4">
    <Skeleton className="ui-h-14" />
    <Skeleton className="ui-h-14" />
    <Skeleton className="ui-h-14" />
  </div>
)
