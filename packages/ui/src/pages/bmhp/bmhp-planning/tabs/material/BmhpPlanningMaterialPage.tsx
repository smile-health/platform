'use client'

import React, { useContext } from 'react'
import BmhpMaterialListPage from '#pages/bmhp/bmhp-material/list/List'

import BmhpPlanningListDetailContainer from '../../list/components/BmhpPlanningListDetailContainer'
import BmhpPlanningDetailContext from '../../list/libs/bmhp-planning-list.context'

const BmhpPlanningMaterialPage: React.FC = () => {
  return (
    <BmhpPlanningListDetailContainer>
      <BmhpMaterialWrapper />
    </BmhpPlanningListDetailContainer>
  )
}

const BmhpMaterialWrapper: React.FC = () => {
  const { yearData } = useContext(BmhpPlanningDetailContext)

  // TODO: Pass yearId to the list component when it supports it
  return (
    <div className="ui-mt-6">
      <BmhpMaterialListPage withLayout={false} />
    </div>
  )
}

export default BmhpPlanningMaterialPage
