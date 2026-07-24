import React from 'react'
import { usePermission } from '#hooks/usePermission'
import { useTranslation } from 'react-i18next'

import ProgramPlanMaterialRatioContainer from './components/ProgramPlanMaterialRatioContainer'
import ProgramPlanMaterialRatioForm from './components/ProgramPlanMaterialRatioForm'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

const ProgramPlanMaterialRatioCreatePage = () => {
  usePermission('program-plan-material-ratio-mutate')
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <Container title="" withLayout />

  const { t } = useTranslation(['common', 'programPlanMaterialRatio'])

  return (
    <ProgramPlanMaterialRatioContainer
      title={t('programPlanMaterialRatio:add_material_ratio')}
    >
      <ProgramPlanMaterialRatioForm />
    </ProgramPlanMaterialRatioContainer>
  )
}

export default ProgramPlanMaterialRatioCreatePage
