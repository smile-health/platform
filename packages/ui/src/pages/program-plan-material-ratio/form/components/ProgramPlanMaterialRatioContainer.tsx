import { ReactNode } from 'react'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import useValidationFinalRatio from '../hooks/useValidationFinalRatio'

type ProgramPlanMaterialRatioContainerProps = {
  title: string
  children: ReactNode
}

export default function ProgramPlanMaterialRatioContainer({
  title,
  children,
}: Readonly<ProgramPlanMaterialRatioContainerProps>) {
  const { t } = useTranslation()
  const router = useSmileRouter()
  const { id: planId } = router.query

  const { detailProgramPlanData } = useValidationFinalRatio()

  if (!detailProgramPlanData || detailProgramPlanData.is_final) return null

  return (
    <Container
      title={title}
      backButton={{
        label: t('back'),
        show: true,
        onClick: () => {
          router.push(`/v5/program-plan/${planId}/ratio`)
        },
      }}
      withLayout
    >
      <Meta title={`SMILE | ${title}`} />
      {children}
    </Container>
  )
}
