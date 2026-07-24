'use client'
import { useTranslation } from "react-i18next"

import Meta from "#components/layouts/Meta"
import Container from "#components/layouts/PageContainer"
import ActivityForm from "#pages/activity/components/ActivityForm"
import { useParams } from "next/navigation"
import { usePermission } from "#hooks/usePermission"

const GlobalSettingProgramActivityCreatePage: React.FC = () => {
  usePermission('activity-global-mutate')
  const { t, i18n: { language } } = useTranslation(['activity', 'programGlobalSettings'])
  const params = useParams()

  return (
    <Container
      withLayout
      title={t('activity:title.create')}
      hideTabs
    >
      <Meta title={`SMILE | ${t('programGlobalSettings:title.list')} ${t('activity:title.create')}`} />

      <div className="mt-6 space-y-6">
        <ActivityForm pathBack={`/${language}/v5/global-settings/program/${params?.id}?tab=activity`} />
      </div>
    </Container>
  )
}

export default GlobalSettingProgramActivityCreatePage
