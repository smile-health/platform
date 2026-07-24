'use client'
import { useTranslation } from "react-i18next"

import Meta from "#components/layouts/Meta"
import Container from "#components/layouts/PageContainer"

import ProgramForm from "./components/ProgramForm"
import { usePermission } from "#hooks/usePermission"

const GlobalSettingProgramCreatePage = () => {
  usePermission('program-global-mutate')
  const { t } = useTranslation(['common', 'programGlobalSettings'])

  return (
    <Container
      withLayout
      title={t('programGlobalSettings:title.create')}
      hideTabs
    >
      <Meta title={`SMILE | Global ${t('programGlobalSettings:title.create')}`} />
      
      <ProgramForm />
    </Container>
  )
}

export default GlobalSettingProgramCreatePage
