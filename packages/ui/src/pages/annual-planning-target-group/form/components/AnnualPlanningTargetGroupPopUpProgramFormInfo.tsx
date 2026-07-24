import React, { useContext } from 'react'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import { useTranslation } from 'react-i18next'

import ProgramPlanDetailContext from '../../../program-plan/list/libs/program-plan-detail.context'

type AnnualPlanningTargetGroupPopUpProgramFormInfoProps = {
  append: (value: { target_group_child: null }) => void
}

const AnnualPlanningTargetGroupPopUpProgramFormInfo = ({
  append,
}: AnnualPlanningTargetGroupPopUpProgramFormInfoProps) => {
  const { t } = useTranslation(['common', 'annualPlanningTargetGroup'])
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext)

  return (
    <div className="ui-flex ui-justify-between ui-items-center">
      <div className="ui-flex ui-justify-start ui-items-start ui-gap-14">
        <div className="ui-flex ui-flex-col">
          <h4 className="ui-text-neutral-500">
            {t('annualPlanningTargetGroup:table.year')}:
          </h4>
          <h5 className="ui-text-dark-teal ui-font-bold">
            {detailProgramPlanData?.year}
          </h5>
        </div>
        <div className="ui-flex ui-flex-col">
          <h4 className="ui-text-neutral-500">
            {t('annualPlanningTargetGroup:table.type')}:
          </h4>
          <h5 className="ui-text-dark-teal ui-font-bold">
            {detailProgramPlanData?.approach?.name}
          </h5>
        </div>
      </div>
      <div className="ui-flex ui-justify-end ui-items-end">
        <Button
          type="button"
          variant="subtle"
          leftIcon={<Plus />}
          onClick={() => append({ target_group_child: null })}
        >
          {t('annualPlanningTargetGroup:add_target_group')}
        </Button>
      </div>
    </div>
  )
}

export default AnnualPlanningTargetGroupPopUpProgramFormInfo
