'use client'

import React, { useContext } from 'react'
import BmhpMethodListPage from '#pages/bmhp/bmhp-method/list/List'

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

  // TODO: Pass yearId to the list component when it supports it
  return (
    <div className="ui-mt-6">
      <BmhpMethodListPage withLayout={false} />
    </div>
  )
}

export default BmhpPlanningMethodPage
