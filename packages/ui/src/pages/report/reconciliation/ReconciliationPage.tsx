import { useMemo } from 'react'
import { useFilter, UseFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { usePermission } from '#hooks/usePermission'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import ReconciliationFilter from './components/ReconciliationFilter'
import { getReconciliationTabs } from './reconciliation.constant'
import reconciliationFilterSchema from './schemas/reconciliationFilterSchema'

export default function ReconciliationPage() {
  usePermission('reconciliation-activity-view')
  const {
    t,
    i18n: { language },
  } = useTranslation('reconciliationReport')

  const { t: tDashboard } = useTranslation('dashboard')

  const filterSchema = useMemo<UseFilter>(
    () => reconciliationFilterSchema(t, tDashboard, language),
    [t, tDashboard, language]
  )

  const filter = useFilter(filterSchema)
  const tabs = getReconciliationTabs(t)

  return (
    <Container title={t('title.page')} withLayout>
      <Meta title={generateMetaTitle(t('title.page'))} />
      <div className="ui-mt-6 ui-space-y-6">
        <ReconciliationFilter filter={filter} />
        <TabsRoot variant="pills" align="center" defaultValue="all">
          <TabsList>
            {tabs.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                buttonClassName="ui-w-40 ui-justify-center"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((item) => {
            const Content = item.component
            return (
              <TabsContent key={item.id} value={item.id}>
                <Content filter={filter?.query} />
              </TabsContent>
            )
          })}
        </TabsRoot>
      </div>
    </Container>
  )
}
