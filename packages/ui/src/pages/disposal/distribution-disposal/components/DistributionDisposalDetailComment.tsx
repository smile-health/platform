import React, { useContext } from 'react'
import { UserIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import { TextArea } from '#components/text-area'
import { parseDateTime } from '#utils/date'
import { getFullName } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { STATUS_DISTRIBUTION_DISPOSAL } from '../constants/status'
import { useDistributionDisposalPostComment } from '../hooks/useDistributionDisposalPostComment'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

const DistributionDisposalDetailComment = () => {
  const { data, inProcess, setComment, comment } = useContext(
    DistributionDisposalDetailContext
  )
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])

  const { mutate: handlePostComment, isPending: isPendingPostComment } =
    useDistributionDisposalPostComment(t, language)

  const statusLabel = (status: number) => {
    switch (status) {
      case STATUS_DISTRIBUTION_DISPOSAL.APPROVED:
        return t('distributionDisposal:filter.status.fulfilled')
      case STATUS_DISTRIBUTION_DISPOSAL.SENT:
        return t('distributionDisposal:filter.status.shipped')
      case STATUS_DISTRIBUTION_DISPOSAL.CANCELLED:
        return t('distributionDisposal:filter.status.cancelled')
      default:
        return ''
    }
  }

  return (
    <div className="ui-border ui-rounded ui-p-6 ui-space-y-3 ui-border-neutral-300 ui-mt-6">
      <p className="ui-text-dark-teal ui-font-semibold">
        {t('distributionDisposal:detail.comment.title')} (
        {(data?.disposal_comments ?? []).length})
      </p>
      {!inProcess && (
        <div className="ui-flex ui-gap-2">
          <TextArea
            placeholder={t('distributionDisposal:detail.comment.placeholder')}
            className="ui-min-h-[80px] ui-text-sm"
            disabled={isPendingPostComment}
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ui-min-w-[150px]"
            onClick={() => handlePostComment()}
            disabled={isPendingPostComment || !comment}
          >
            {t('distributionDisposal:detail.action.submit_comment')}
          </Button>
        </div>
      )}
      {(data?.disposal_comments ?? []).length > 0 && (
        <div className="ui-space-y-4">
          {data?.disposal_comments.map((item) => (
            <div
              key={`comment-item-${item.id}`}
              data-testid={`comment-item-${item.id}`}
              className="ui-border ui-border-neutral-300 ui-rounded ui-p-4 ui-flex ui-gap-2 ui-items-start ui-w-full"
            >
              <UserIcon className="ui-min-w-5 ui-w-5 ui-fill-gray-500 ui-mt-0.5" />
              <div className="ui-space-y-1 ui-w-full">
                <div className="ui-flex ui-justify-between ui-items-center">
                  <div className="ui-flex ui-gap-1.5">
                    <span className="ui-text-dark-blue ui-font-semibold">
                      {getFullName(item.user.firstname, item.user.lastname)}
                    </span>
                    <span className="ui-text-gray-500">
                      {parseDateTime(
                        item.created_at,
                        'DD MMM YYYY HH:mm',
                        language
                      ).toUpperCase()}
                    </span>
                    <span className="ui-h-5 ui-w-px ui-bg-neutral-300" />
                    <span className="ui-text-gray-500">
                      {`${t('distributionDisposal:detail.comment.status_at_posting')}: ${statusLabel(item.disposal_shipment_status)}`}
                    </span>
                  </div>
                </div>
                <div className="ui-text-dark-blue ui-break-all">
                  {item.comment ?? '-'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DistributionDisposalDetailComment
