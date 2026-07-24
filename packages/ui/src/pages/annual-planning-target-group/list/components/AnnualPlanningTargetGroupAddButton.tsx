import React, { useContext } from 'react'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import AnnualPlanningTargetGroupPopUpForm from '#pages/annual-planning-target-group/form/components/AnnualPlanningTargetGroupPopUpForm'
import AnnualPlanningTargetGroupPopUpProgramForm from '#pages/annual-planning-target-group/form/components/AnnualPlanningTargetGroupPopUpProgramForm'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import ProgramPlanDetailContext from '../../../program-plan/list/libs/program-plan-detail.context'
import AnnualPlanningTargetGroupListContext from '../libs/annual-planning-target-group-list.context'

type AnnualPlanningTargetGroupAddButtonProps = {
  handleAdd: () => void
}

const AnnualPlanningTargetGroupAddButton = ({
  handleAdd,
}: AnnualPlanningTargetGroupAddButtonProps) => {
  const { t } = useTranslation(['common', 'annualPlanningTargetGroup'])
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext) ?? {}
  const { isGlobal } = useContext(AnnualPlanningTargetGroupListContext)
  const hasGlobalMutatePermission = hasPermission(
    'annual-planning-target-group-global-mutate'
  )
  const hasMutatePermission = hasPermission(
    'annual-planning-target-group-mutate'
  )

  return (
    <>
      {hasGlobalMutatePermission && isGlobal && (
        <AnnualPlanningTargetGroupPopUpForm />
      )}
      {detailProgramPlanData &&
        hasMutatePermission &&
        !isGlobal &&
        !detailProgramPlanData?.is_final && (
          <AnnualPlanningTargetGroupPopUpProgramForm />
        )}
      {(isGlobal && hasGlobalMutatePermission) ||
      (detailProgramPlanData &&
        !isGlobal &&
        !detailProgramPlanData?.is_final &&
        hasMutatePermission) ? (
        <Button
          variant="solid"
          type="button"
          leftIcon={<Plus className="ui-size-5" />}
          onClick={handleAdd}
        >
          {t('annualPlanningTargetGroup:add')}
        </Button>
      ) : null}
    </>
  )
}

export default AnnualPlanningTargetGroupAddButton
