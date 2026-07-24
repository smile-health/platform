'use client'

import Meta from "#components/layouts/Meta"
import Container from "#components/layouts/PageContainer"
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "#components/tabs"
import ProgramDetailsDetail from "./components/ProgramDetailsDetail"
import ProgramDetailsActivity from "./components/ProgramDetailsActivity"

import { useGlobalSettingProgramDetailPage } from "./hooks/useGlobalSettingProgramDetailPage"
import { usePermission } from "#hooks/usePermission"

const GlobalSettingProgramDetailPage = () => {
  usePermission('program-global-view')
  const {
    t,
    query,
    setQuery,
    data,
  } = useGlobalSettingProgramDetailPage()

  return (
    <Container
      withLayout
      title={t('programGlobalSettings:title.detail')}
      hideTabs
    >
      <Meta title={`SMILE | Global ${t('programGlobalSettings:title.detail')}`} />

      <TabsRoot value={query.tab} variant="default" onValueChange={e => setQuery({ tab: e })}>
        <TabsList>
          <TabsTrigger value="detail">
            {t('programGlobalSettings:details.tabs_title.detail')}
          </TabsTrigger>
          <TabsTrigger value="activity">
            {t('programGlobalSettings:details.tabs_title.activity')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="detail">
          <ProgramDetailsDetail
            data={data}
          />
        </TabsContent>
        <TabsContent value="activity">
          <ProgramDetailsActivity />
        </TabsContent>
      </TabsRoot>
    </Container>
  )
}

export default GlobalSettingProgramDetailPage
