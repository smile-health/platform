import React, { useContext, useState } from 'react'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'

import BmhpPlanningDetailContext from '../libs/bmhp-planning-list.context'
import BmhpPlanningMarkAsFinalModal from './BmhpPlanningMarkAsFinalModal'
import BmhpPlanningStatusCapsule from './BmhpPlanningStatusCapsule'

const BmhpPlanningInfoBox = () => {
  const { t } = useTranslation(['common', 'bmhpPlanning'])
  const { yearData, refetchYearData } = useContext(BmhpPlanningDetailContext)
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenFinalModal = async () => {
    if (refetchYearData) {
      setIsLoading(true)
      await refetchYearData()
      setIsLoading(false)
    }
    setShowFinalModal(true)
  }

  return (
    <>
      <BmhpPlanningMarkAsFinalModal
        open={showFinalModal}
        onClose={() => setShowFinalModal(false)}
        status={yearData?.status}
      />
      <div className="ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-flex ui-justify-between ui-items-start">
        <div className="ui-flex ui-flex-col ui-gap-2">
          <div className="ui-table">
            <div className="ui-table-row">
              <div className="ui-table-cell ui-pb-1 ui-pr-4 ui-text-neutral-500 ui-w-96">
                <BmhpPlanningStatusCapsule
                  isFinal={yearData?.is_final}
                />
              </div>
            </div>
            <div className="ui-table-row">
              <div className="ui-table-cell ui-py-1 ui-pr-4 ui-text-neutral-500 ui-w-96">
                {t('bmhpPlanning:year_plan')}
              </div>
              <div className="ui-table-cell ui-py-1 ui-text-dark-teal">
                : {yearData?.year ?? '-'}
              </div>
            </div>
          </div>
        </div>
        {yearData && !yearData.is_final && (
          <Button
            type="button"
            variant="outline"
            color="primary"
            loading={isLoading}
            onClick={handleOpenFinalModal}
          >
            {t('bmhpPlanning:mark_as_final')}
          </Button>
        )}
      </div>
    </>
  )
}

export default BmhpPlanningInfoBox
