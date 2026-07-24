import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { detailProgramPlanMaterialRatio } from '../services/program-plan-material-ratio.services'
import ProgramPlanMaterialRatioContainer from './components/ProgramPlanMaterialRatioContainer'
import ProgramPlanMaterialRatioForm from './components/ProgramPlanMaterialRatioForm'
import useValidationFinalRatio from './hooks/useValidationFinalRatio'
import { useAnnualPlanningEnabled } from '#hooks/useAnnualPlanningEnabled'
import Container from '#components/layouts/PageContainer'

const ProgramPlanMaterialRatioEditPage = () => {
  usePermission('program-plan-material-ratio-mutate')
  const { t } = useTranslation(['common', 'programPlanMaterialRatio'])
  const router = useSmileRouter()
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <Container title="" withLayout />

  const {
    query: { id: planId, ratioId: id },
  } = router

  const {
    data: programPlanMaterialRatioData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['program-plan-material-ratio', planId, id],
    queryFn: () => detailProgramPlanMaterialRatio(Number(id)),
    enabled: !!id && !!planId && router.isReady,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  const { detailProgramPlanData } = useValidationFinalRatio()

  if (!programPlanMaterialRatioData || !detailProgramPlanData) {
    return null
  }

  return (
    <ProgramPlanMaterialRatioContainer
      title={t('programPlanMaterialRatio:edit_material_ratio')}
    >
      <ProgramPlanMaterialRatioForm data={programPlanMaterialRatioData} />
    </ProgramPlanMaterialRatioContainer>
  )
}

export default ProgramPlanMaterialRatioEditPage
