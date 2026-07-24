'use client'

import React, { useContext } from 'react'
import BmhpPemeriksaanListPage from '#pages/bmhp/bmhp-pemeriksaan/list/List'

import BmhpPlanningListDetailContainer from '../../list/components/BmhpPlanningListDetailContainer'
import BmhpPlanningDetailContext from '../../list/libs/bmhp-planning-list.context'

const BmhpPlanningMasterPemeriksaanPage: React.FC = () => {
  return (
    <BmhpPlanningListDetailContainer>
      <BmhpPemeriksaanWrapper />
    </BmhpPlanningListDetailContainer>
  )
}

const BmhpPemeriksaanWrapper: React.FC = () => {
  const { yearData } = useContext(BmhpPlanningDetailContext)

  // TODO: Pass yearId to the list component when it supports it
  // For now, just render the existing component
  return (
    <div className="ui-mt-6">
      <BmhpPemeriksaanListPage withLayout={false} />
    </div>
  )
}

export default BmhpPlanningMasterPemeriksaanPage
