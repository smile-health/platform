'use client'

import React, { useContext } from 'react'
import BmhpMaterialListPage from '#pages/bmhp/bmhp-target-group/list/List'

import BmhpPlanningListDetailContainer from '../../list/components/BmhpPlanningListDetailContainer'
import BmhpPlanningDetailContext from '../../list/libs/bmhp-planning-list.context'

const BmhpPlanningMethodPage: React.FC = () => {
  return (
    <BmhpPlanningListDetailContainer>
      <BmhpMethodWrapper />
    </BmhpPlanningListDetailContainer>
  )
}

const BmhpMethodWrapper: React.FC = () => {
  const { yearData } = useContext(BmhpPlanningDetailContext)

  return (
    <div className="ui-mt-6">
      <BmhpMaterialListPage
        withLayout={false}
        yearId={yearData?.id}
        program_plan_id={yearData?.id}
      />
    </div>
  )
}

export default BmhpPlanningMethodPage
