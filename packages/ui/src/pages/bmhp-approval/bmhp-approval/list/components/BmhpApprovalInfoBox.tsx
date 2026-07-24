import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import BmhpApprovalDetailContext from '../libs/bmhp-approval-detail.context'
import BmhpApprovalStatusBadge from './BmhpApprovalStatusBadge'

const BmhpApprovalInfoBox: React.FC = () => {
  const { t } = useTranslation(['common', 'bmhpApproval'])
  const { approvalData } = useContext(BmhpApprovalDetailContext)

  return (
    <div className="ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-flex ui-justify-between ui-items-start">
      <div className="ui-flex ui-flex-col ui-gap-2">
        <div className="ui-table">
          <div className="ui-table-row">
            <div className="ui-table-cell ui-pb-1 ui-pr-4 ui-text-neutral-500 ui-w-96">
              {approvalData?.status && (
                <BmhpApprovalStatusBadge status={approvalData.status} />
              )}
            </div>
          </div>
          <div className="ui-table-row">
            <div className="ui-table-cell ui-py-1 ui-pr-4 ui-text-neutral-500 ui-w-96">
              {t('bmhpApproval:label.year')}
            </div>
            <div className="ui-table-cell ui-py-1 ui-text-dark-teal">
              : {approvalData?.year ?? '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BmhpApprovalInfoBox
