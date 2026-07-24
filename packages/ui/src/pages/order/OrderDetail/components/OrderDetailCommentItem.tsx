import { UserIcon } from '@heroicons/react/24/solid'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useOrder } from '../../hooks/useOrder'
import { OrderDetailComment } from '../order-detail.type'

export const OrderDetailCommentItem = ({
  id,
  user,
  created_at,
  order_status,
  comment,
}: OrderDetailComment) => {
  const { t } = useTranslation('orderDetail')

  const { orderStatus } = useOrder()

  return (
    <div
      data-testid={`comment-item-${id}`}
      className="ui-border ui-rounded ui-p-4 ui-flex ui-gap-2 ui-items-start"
    >
      <UserIcon className="ui-min-w-5 ui-w-5 ui-fill-gray-500 ui-mt-0.5" />
      <div className="ui-space-y-1">
        <div className="ui-flex ui-gap-1.5">
          <span className="ui-text-dark-blue ui-font-semibold ">
            {getFullName(user?.firstname, user?.lastname)}
          </span>
          <span className="ui-text-gray-500">
            {dayjs(created_at).format('DD MMM YYYY HH:mm').toUpperCase()} |{' '}
            {t('data.status_at_posting')}: {orderStatus[order_status].label}
          </span>
        </div>
        <div className="ui-text-dark-blue ui-break-all">
          {typeof comment === 'object'
            ? JSON.stringify(comment)
            : comment.split('\n').map((item) => (
                <span key={item}>
                  {item}
                  <br />
                </span>
              ))}
        </div>
      </div>
    </div>
  )
}
