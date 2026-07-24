import React, { useContext, useMemo, useState } from 'react'
import { Button } from '#components/button'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import ProgramPlanDetailContext from '../libs/program-plan-detail.context'
import ProgramPlanListContext from '../libs/program-plan-list.context'
import { TProgramPlanData } from '../libs/program-plan-list.type'
import ProgramPlanMarkAsFinalModal from './ProgramPlanMarkAsFinalModal'
import ProgramPlanStatusCapsule from './ProgramPlanStatusCapsule'

const ProgramPlanApproachBox = () => {
  const { t } = useTranslation(['common', 'programPlan'])
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext)
  const [popUpDataRow, setPopUpDataRow] = useState<TProgramPlanData | null>(
    null
  )

  const value = useMemo(
    () => ({ popUpDataRow, setPopUpDataRow }),
    [popUpDataRow, setPopUpDataRow]
  )

  return (
    <ProgramPlanListContext.Provider value={value}>
      <ProgramPlanMarkAsFinalModal />
      <div className="ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-flex ui-justify-between ui-items-start">
        <div className="ui-flex ui-flex-col ui-gap-2">
          <div className="ui-table">
            <div className="ui-table-row">
              <div className="ui-table-cell ui-pb-1 ui-pr-4 ui-text-neutral-500 ui-w-96">
                <ProgramPlanStatusCapsule
                  isFinale={detailProgramPlanData?.is_final as boolean}
                />
              </div>
            </div>
            <div className="ui-table-row">
              <div className="ui-table-cell ui-py-1 ui-pr-4 ui-text-neutral-500 ui-w-96">
                {t('programPlan:table.year_plan')}
              </div>
              <div className="ui-table-cell ui-py-1 ui-text-dark-teal">
                : {detailProgramPlanData?.year ?? '-'}
              </div>
            </div>
            <div className="ui-table-row">
              <div className="ui-table-cell ui-py-1 ui-pr-4 ui-text-neutral-500 ui-w-96">
                {t('programPlan:table.approach')}
              </div>
              <div className="ui-table-cell ui-py-1 ui-text-dark-teal">
                : {detailProgramPlanData?.approach?.name ?? '-'}
              </div>
            </div>
          </div>
        </div>
        {detailProgramPlanData &&
          hasPermission('program-plan-mutate') &&
          !detailProgramPlanData?.is_final && (
            <Button
              type="button"
              variant="outline"
              color="primary"
              onClick={() => setPopUpDataRow(detailProgramPlanData)}
            >
              {t('programPlan:mark_as_final')}
            </Button>
          )}
      </div>
    </ProgramPlanListContext.Provider>
  )
}

export default ProgramPlanApproachBox
