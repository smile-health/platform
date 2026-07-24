import React from 'react'
import cx from 'classnames'
import { useTranslation } from 'react-i18next'

/**
 * Province Approval Status Codes:
 *   0 = Not Submitted (Belum Submit)
 *   1 = Submitted, Not Yet Reviewed (Sudah Disubmit, Belum Ditinjau)
 *   2 = Not Submitted (Belum Submit)
 *   3 = Submitted, Reviewed (Sudah Disubmit, Telah Ditinjau)
 */

type ReportStatusProps = { approvalStatus: number }
type ReviewStatusProps = { approvalStatus: number }

/** Report / submission status pill */
export const ProvinceReportStatusBadge: React.FC<ReportStatusProps> = ({
  approvalStatus,
}) => {
  const { t } = useTranslation(['bmhpApproval'])

  const isSubmitted = approvalStatus === 1 || approvalStatus === 3

  const className = cx(
    'ui-px-3 ui-py-1 ui-rounded-full ui-w-fit ui-font-semibold ui-text-sm ui-flex ui-items-center ui-gap-1.5',
    {
      'ui-text-green-700 ui-bg-green-100': isSubmitted,
      'ui-text-red-600 ui-bg-red-100': !isSubmitted,
    }
  )

  return (
    <div className={className}>
      {isSubmitted
        ? t('bmhpApproval:province_approval.status.submitted')
        : t('bmhpApproval:province_approval.status.not_submitted')}
    </div>
  )
}

/** Review status pill (only shown when approvalStatus is 1 or 3) */
export const ProvinceReviewStatusBadge: React.FC<ReviewStatusProps> = ({
  approvalStatus,
}) => {
  const { t } = useTranslation(['bmhpApproval'])

  if (approvalStatus === 0 || approvalStatus === 2) {
    return <span className="ui-text-gray-400">-</span>
  }

  const isReviewed = approvalStatus === 3

  const className = cx(
    'ui-px-3 ui-py-1 ui-rounded-full ui-w-fit ui-font-semibold ui-text-sm ui-flex ui-items-center ui-gap-1.5',
    {
      'ui-text-green-700 ui-bg-green-100': isReviewed,
      'ui-text-blue-700 ui-bg-blue-100': !isReviewed,
    }
  )

  return (
    <div className={className}>
      {isReviewed ? (
        <>
          {t('bmhpApproval:province_approval.status.reviewed')}
        </>
      ) : (
        t('bmhpApproval:province_approval.status.not_reviewed')
      )}
    </div>
  )
}
