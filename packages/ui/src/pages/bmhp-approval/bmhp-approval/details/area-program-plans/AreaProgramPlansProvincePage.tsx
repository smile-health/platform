'use client'

import React, { useContext } from 'react'
import { useProfile } from '#shared/auth'
import { useTranslation } from 'react-i18next'

import BmhpApprovalProvinceDetailTabs from '../../components/BmhpApprovalProvinceDetailTabs'
import BmhpApprovalProvinceDetailContext from '../../tabs/province-completeness/libs/bmhp-approval-province-detail.context'

// ── Page Content ──────────────────────────────────────────────────────────────

const AreaProgramPlansProvincePageContent: React.FC = () => {
  const { t } = useTranslation(['bmhpApproval', 'common'])
  const { approvalData } = useContext(BmhpApprovalProvinceDetailContext)
  const { data: profile } = useProfile()

  const provinceName = profile?.entity?.province?.name ?? '-'
  const programYear = approvalData?.year ?? '-'

  return (
    <div className="ui-p-4 ui-border ui-border-gray-200 ui-rounded-lg ui-bg-white ui-space-y-4">
      {/* Header */}
      <div className="ui-flex ui-items-center ui-justify-between">
        <h3 className="ui-text-sm ui-font-semibold ui-text-neutral-700">
          {t('bmhpApproval:label.details', 'Details')}
        </h3>
      </div>

      {/* Info rows */}
      <div className="ui-flex ui-flex-col ui-gap-2">
        <div className="ui-flex ui-items-center ui-gap-2">
          <span className="ui-text-sm ui-text-neutral-500 ui-w-36">
            {t('bmhpApproval:completeness.province')}
          </span>
          <span className="ui-text-sm">: {provinceName}</span>
        </div>
        <div className="ui-flex ui-items-center ui-gap-2">
          <span className="ui-text-sm ui-text-neutral-500 ui-w-36">
            {t('bmhpApproval:completeness.program_plan')}
          </span>
          <span className="ui-text-sm">: {programYear}</span>
        </div>
      </div>
    </div>
  )
}

// ── Wrapped with province detail tabs ─────────────────────────────────────────

const AreaProgramPlansProvincePage: React.FC = () => {
  return (
    <BmhpApprovalProvinceDetailTabs>
      <AreaProgramPlansProvincePageContent />
    </BmhpApprovalProvinceDetailTabs>
  )
}

export default AreaProgramPlansProvincePage
