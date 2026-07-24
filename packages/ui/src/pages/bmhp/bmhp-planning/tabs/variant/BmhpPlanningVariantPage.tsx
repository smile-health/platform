'use client'

import React, { useContext } from 'react'
import BmhpVariantListPage from '#pages/bmhp/bmhp-variant/list/List'

import BmhpPlanningListDetailContainer from '../../list/components/BmhpPlanningListDetailContainer'
import BmhpPlanningDetailContext from '../../list/libs/bmhp-planning-list.context'

const BmhpPlanningVariantPage: React.FC = () => {
  return (
    <BmhpPlanningListDetailContainer>
      <BmhpVariantWrapper />
    </BmhpPlanningListDetailContainer>
  )
}

const BmhpVariantWrapper: React.FC = () => {
  const { yearData } = useContext(BmhpPlanningDetailContext)

  // TODO: Pass yearId to the list component when it supports it
  return (
    <div className="ui-mt-6">
      <BmhpVariantListPage withLayout={false} />
    </div>
  )
}

export default BmhpPlanningVariantPage
