'use client'

import React from 'react'
import BmhpPopulasiListPage from '#pages/bmhp/bmhp-populasi/list/List'

import BmhpPlanningListDetailContainer from '../../list/components/BmhpPlanningListDetailContainer'

const BmhpPlanningPopulasiPage: React.FC = () => {
  return (
    <BmhpPlanningListDetailContainer>
      <BmhpPopulasiWrapper />
    </BmhpPlanningListDetailContainer>
  )
}

const BmhpPopulasiWrapper: React.FC = () => {
  return (
    <div className="ui-mt-6">
      <BmhpPopulasiListPage withLayout={false} />
    </div>
  )
}

export default BmhpPlanningPopulasiPage
