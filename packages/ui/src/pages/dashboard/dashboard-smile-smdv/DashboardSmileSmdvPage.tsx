import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { usePermission } from '#hooks/usePermission'
import { generateMetaTitle } from '#utils/strings'

import DashboardInformation from '../components/DashboardInformation'
import DashboardSmileSmdvFilter from './components/DashboardSmileSmdvFilter'
import DashboardSmileSmdvSummaryCard from './components/DashboardSmileSmdvSummaryCard'
import { getTabs, TableType } from './dashboard-smile-smdv.constant'
import { useDashboardSmileSmdv } from './hooks/useDashboardSmileSmdv'

export default function DashboardSmileSmdvPage() {
  usePermission('dashboard-smile-smdv-view')
  const {
    t,
    data,
    page,
    filter,
    summary,
    paginate,
    activeTab,
    exportQuery,
    setActiveTab,
    setPagination,
    isLoadingTable,
    showInformation,
    defaultDashboard,
    setShowInformation,
    setDefaultDashboard,
  } = useDashboardSmileSmdv()

  const tabs = getTabs(t)

  return (
    <Container
      title={t('title.page')}
      withLayout
      showInformation
      onClickInformation={() => setShowInformation(true)}
    >
      <Meta title={generateMetaTitle(t('title.page'))} />
      <DashboardInformation
        title={t('information.title')}
        open={showInformation}
        setOpen={setShowInformation}
        description={t('information.description')}
      />
      <div className="ui-mt-6 ui-space-y-6">
        <DashboardSmileSmdvFilter
          filter={filter}
          setDefaultDashboard={setDefaultDashboard}
          onExport={() => exportQuery.refetch()}
        />
        <DashboardSmileSmdvSummaryCard
          data={summary}
          defaultDashboard={defaultDashboard}
        />
        <TabsRoot
          variant="pills"
          align="center"
          orientation="horizontal"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TableType)}
        >
          <TabsList className="ui-w-full">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                buttonClassName="ui-w-full ui-justify-center"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((item) => {
            const Content = item.component
            return (
              <TabsContent key={item.id} value={item.id}>
                <Content
                  data={data}
                  page={page}
                  paginate={paginate}
                  activeTab={activeTab}
                  isLoading={isLoadingTable}
                  setPagination={setPagination}
                  defaultDashboard={defaultDashboard}
                />
              </TabsContent>
            )
          })}
        </TabsRoot>
      </div>
    </Container>
  )
}
