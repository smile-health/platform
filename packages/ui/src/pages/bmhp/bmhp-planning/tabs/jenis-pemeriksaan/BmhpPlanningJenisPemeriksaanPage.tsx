'use client'

import React, { useContext } from 'react'
import BmhpExaminationTypeListPage from '#pages/bmhp/bmhp-examination-type/list/List'

import BmhpPlanningListDetailContainer from '../../list/components/BmhpPlanningListDetailContainer'
import BmhpPlanningDetailContext from '../../list/libs/bmhp-planning-list.context'

const BmhpPlanningJenisPemeriksaanPage: React.FC = () => {
  return (
    <BmhpPlanningListDetailContainer>
      <BmhpExaminationTypeWrapper />
    </BmhpPlanningListDetailContainer>
  )
}

const BmhpExaminationTypeWrapper: React.FC = () => {
  const { yearData } = useContext(BmhpPlanningDetailContext)

  // TODO: Pass yearId to the list component when it supports it
  return (
    <div className="ui-mt-6">
      <BmhpExaminationTypeListPage withLayout={false} yearId={yearData?.id} />
    </div>
  )
}

export default BmhpPlanningJenisPemeriksaanPage
