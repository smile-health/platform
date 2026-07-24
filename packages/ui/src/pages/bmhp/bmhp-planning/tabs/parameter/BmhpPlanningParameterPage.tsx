'use client'

import React, { useContext } from 'react'
import BmhpParameterListPage from '#pages/bmhp/bmhp-parameter/list/List'

import BmhpPlanningListDetailContainer from '../../list/components/BmhpPlanningListDetailContainer'
import BmhpPlanningDetailContext from '../../list/libs/bmhp-planning-list.context'

const BmhpPlanningParameterPage: React.FC = () => {
  return (
    <BmhpPlanningListDetailContainer>
      <BmhpParameterWrapper />
    </BmhpPlanningListDetailContainer>
  )
}

const BmhpParameterWrapper: React.FC = () => {
  const { yearData } = useContext(BmhpPlanningDetailContext)

  // TODO: Pass yearId to the list component when it supports it
  return (
    <div className="ui-mt-6">
      <BmhpParameterListPage withLayout={false} />
    </div>
  )
}

export default BmhpPlanningParameterPage
