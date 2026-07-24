import { Button } from '#components/button'
import { toast } from '#components/toast'
import { useCopyToClipboard } from '#hooks/useCopyToClipboard'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { OrderDetailInteroperabilityLogs } from '../../order-detail.type'
import { OrderDetailModal } from '../OrderDetailModal'

import 'dayjs/locale/en'
import 'dayjs/locale/id'

type OrderDetailHistoryModalProps = {
  isOpen: boolean
  onClose: () => void
  data?: OrderDetailInteroperabilityLogs
}

export const OrderDetailHistoryModal = ({
  data,
  isOpen,
  onClose,
}: OrderDetailHistoryModalProps) => {
  const { t, i18n } = useTranslation(['common', 'orderDetail'])

  const [_, copy] = useCopyToClipboard()

  const handleCopyHistory = async () => {
    const texts = [
      [
        t('orderDetail:data.created_at'),
        `${
          data?.created_at
            ? dayjs(data?.created_at)
                .locale(i18n.language)
                .format('DD MMMM YYYY HH:mm')
            : '-'
        } ${t('common:by')} ${data?.source}`,
      ],
      [t('common:action'), data?.action],
      ['URL', data?.request.url],
      ['Response Code', data?.response.status],
      ['Payload', JSON.stringify(data?.request.body, null, 2)],
      ['Response Body', JSON.stringify(data?.response.body, null, 2)],
    ]

    const text = texts.join('\n').replaceAll(',', ': ')

    try {
      copy(text)
      toast.success({ title: 'Copy history success' })
    } catch (error) {
      toast.danger({ title: 'Copy history failed' })
    }
  }

  return (
    <OrderDetailModal
      size="xl"
      title={t('orderDetail:modal.order_history_detail.title')}
      open={isOpen}
      onClose={onClose}
      cancelButton={{
        label: t('common:close'),
        className: 'ui-w-full',
      }}
    >
      <div className="ui-space-y-6 relative">
        <div className="ui-right-0 ui-top-0 ui-absolute">
          <Button variant="outline" color="primary" onClick={handleCopyHistory}>
            {t('orderDetail:button.copy_history')}
          </Button>
        </div>
        <div className="ui-text-primary-500">
          {data?.created_at
            ? dayjs(data?.created_at)
                .locale(i18n.language)
                .format('DD MMMM YYYY HH:mm')
            : '-'}{' '}
          {t('common:by')} {data?.source ?? '-'}
        </div>
        <div>
          <div className="ui-text-gray-500">{t('common:action')}</div>
          <div className="ui-text-primary-500">{data?.action ?? '-'}</div>
        </div>
        <div>
          <div className="ui-text-gray-500">URL</div>
          <div className="ui-text-primary-500">{data?.request.url ?? '-'}</div>
        </div>
        <div>
          <div className="ui-text-gray-500">Response Code</div>
          <div className="ui-text-primary-500">
            {data?.response.status ?? '-'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="ui-text-gray-500">Payload</div>
          <pre className="ui-text-gray-500 border ui-border-gray-300 ui-bg-gray-100 ui-rounded-md ui-text-sm ui-p-2">
            {JSON.stringify(data?.request.body, null, 2)}
          </pre>
        </div>
        <div className="space-y-2">
          <div className="ui-text-gray-500">Response Body</div>
          <pre className="ui-text-gray-500 border ui-border-gray-300 ui-bg-gray-100 ui-rounded-md ui-text-sm ui-p-2">
            {JSON.stringify(data?.response.body, null, 2)}
          </pre>
        </div>
      </div>
    </OrderDetailModal>
  )
}
