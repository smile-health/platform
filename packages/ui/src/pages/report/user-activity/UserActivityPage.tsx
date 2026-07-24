import { useMemo, useRef, useState } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useFilter, UseFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { usePermission } from '#hooks/usePermission'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import UserActivityFilter from './components/UserActivityFilter'
import UserActivityInformation from './components/UserActivityInformation'
import userActivityFilterSchema from './schemas/userActivityFilterSchema'
import { getUserActivityTabs } from './user-activity.constant'

export default function UserActivityPage() {
  usePermission('user-activity-view')

  // Feature with value
  const isShowCustomerActivity = useFeatureIsOn(
    'dashboard.user_activity.customer'
  )

  const {
    t,
    i18n: { language },
  } = useTranslation('userActivity')

  const { t: tDashboard } = useTranslation('dashboard')

  const chartRef = useRef<{ getChart: VoidFunction }>(null)

  const [openInformation, setOpenInformation] = useState(false)
  const [tab, setTab] = useState<string>('overview')

  const filterSchema = useMemo<UseFilter>(
    () =>
      userActivityFilterSchema(t, tDashboard, language, isShowCustomerActivity),
    [t, tDashboard, language, isShowCustomerActivity]
  )

  const filter = useFilter(filterSchema)
  const tabs = getUserActivityTabs(t)

  return (
    <Container
      title={t('title.page')}
      showInformation
      withLayout
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={generateMetaTitle(t('title.page'))} />
      <UserActivityInformation
        open={openInformation}
        setOpen={setOpenInformation}
      />
      <div className="ui-mt-6 ui-space-y-6">
        <UserActivityFilter
          filter={filter}
          isDisabledExport={tab === 'overview'}
          onSearch={() => {
            if (tab === 'overview') {
              chartRef.current?.getChart()
            }
          }}
        />
        <TabsRoot variant="pills" align="center" defaultValue="overview">
          <TabsList>
            {tabs.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                onClick={() => {
                  setTab(item.id)
                  if (item.id === 'overview') {
                    chartRef.current?.getChart()
                  }
                }}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((item) => {
            const Content = item.component
            return (
              <TabsContent key={item.id} value={item.id}>
                <Content ref={chartRef} filter={filter?.query} />
              </TabsContent>
            )
          })}
        </TabsRoot>
      </div>
    </Container>
  )
}
