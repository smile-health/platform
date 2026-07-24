'use client'

import AnnualPlanningTargetGroupListPage from '#pages/annual-planning-target-group/list/AnnualPlanningTargetGroupListPage'

import GlobalSettings from '../GlobalSettings'

const GlobalSettingAnnualPlanningTargetGroupListPage = () => {
  return (
    <GlobalSettings>
      <AnnualPlanningTargetGroupListPage isGlobal />
    </GlobalSettings>
  )
}

export default GlobalSettingAnnualPlanningTargetGroupListPage
