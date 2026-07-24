import React, { FC } from 'react'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { STATUS_DISTRIBUTION_DISPOSAL } from '../constants/status'

type DistributionDisposalListStatusCapsuleProps = {
  status: number
  date?: string | null
  user?: string | null
  capsuleOnly?: boolean
}
const DistributionDisposalListStatusCapsule: FC<
  DistributionDisposalListStatusCapsuleProps
> = ({ status, date, user, capsuleOnly = false }) => {
  const { t } = useTranslation(['common', 'distributionDisposal'])
  let statusText = null
  switch (status) {
    case STATUS_DISTRIBUTION_DISPOSAL.APPROVED:
      statusText = t('distributionDisposal:filter.status.fulfilled')
      break
    case STATUS_DISTRIBUTION_DISPOSAL.SENT:
      statusText = t('distributionDisposal:filter.status.shipped')
      break
    case STATUS_DISTRIBUTION_DISPOSAL.CANCELLED:
      statusText = t('distributionDisposal:filter.status.cancelled')
      break
    default:
      statusText = ''
  }

  if (!statusText) {
    return null
  }
  const boxStyle = cx(
    'ui-text-sm ui-font-normal ui-text-center ui-whitespace-nowrap',
    'ui-py-1 ui-px-4 ui-w-full ui-rounded-full',
    {
      'ui-text-success-500 ui-bg-success-50':
        status === STATUS_DISTRIBUTION_DISPOSAL.APPROVED ||
        status === STATUS_DISTRIBUTION_DISPOSAL.SENT,
      'ui-text-danger-500 ui-bg-danger-50':
        status === STATUS_DISTRIBUTION_DISPOSAL.CANCELLED,
    }
  )
  if (capsuleOnly) {
    return <div className={boxStyle}>{statusText}</div>
  }

  if (!date && !user && !capsuleOnly) return null

  return (
    <div className="ui-flex ui-flex-col ui-items-center ui-min-w-40">
      <div className={boxStyle}>{statusText}</div>
      <div className="ui-p-2 ui-text-center ui-text-sm">
        <div className="ui-text-gray-500 ui-uppercase">{date}</div>
        <div className="ui-text-dark-teal">
          {`${t('common:by')} ${user ?? ''}`}
        </div>
      </div>
    </div>
  )
}

export default DistributionDisposalListStatusCapsule
