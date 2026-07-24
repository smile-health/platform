import { useEffect, useMemo, useRef, useState } from 'react'
import { parseDate } from '@internationalized/date'
import { useFilter, UseFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { usePermission } from '#hooks/usePermission'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardFilter from '../components/DashboardFilter'
import DashboardInformation from '../components/DashboardInformation'
import { TDashboardIOTHandler } from '../dashboard.type'
import {
  DASHBOARD_DISCARD_CONTENT,
  DashboardDiscardTabType,
  getDashboardTabs,
} from './dashboard-discard.constant'
import dashboardDiscardFilterSchema from './schemas/dashboardDiscardFilterSchema'

export default function DashboardDiscardPage() {
  usePermission('dashboard-discard-view')

  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardDiscard')
  const { t: tDashboard } = useTranslation('dashboard')

  const ref = useRef<TDashboardIOTHandler>(null)

  const onResetPage = () => {
    if (ref.current?.onResetPage) ref.current?.onResetPage()
  }
  const onExport = () => ref.current?.onExport()

  const [showInformation, setShowInformation] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const filterSchema = useMemo<UseFilter>(
    () => dashboardDiscardFilterSchema(t, tDashboard, language),

    [t, tDashboard, language]
  )

  const filter = useFilter(filterSchema)

  const tabs = getDashboardTabs(t)

  const { range, period } = filter.watch()

  useEffect(() => {
    const start =
      typeof range?.start === 'string' ? parseDate(range?.start) : range?.start
    const end =
      typeof range?.end === 'string' ? parseDate(range?.end) : range?.end

    if (start && end) {
      const over =
        end.compare(start.add({ days: period?.value === 'day' ? 30 : 365 })) > 0
      setIsDisabled(over)
    } else {
      setIsDisabled(false)
    }
  }, [range, period])

  return (
    <Container
      title={t('title')}
      withLayout
      showInformation
      onClickInformation={() => setShowInformation(true)}
    >
      <Meta title={generateMetaTitle(t('title'))} />
      <DashboardInformation
        title={t('title')}
        open={showInformation}
        setOpen={setShowInformation}
        description={t('description')}
        details={t('information', { returnObjects: true })}
      />
      <div className="ui-space-y-6">
        <DashboardFilter
          filter={filter}
          isDisabledSubmit={isDisabled}
          onExport={onExport}
          onSubmit={() => {
            onResetPage()
            setTimeout(() => {
              setEnabled(true)
            }, 150)
          }}
        />
        <TabsRoot
          variant="pills"
          align="center"
          defaultValue={DashboardDiscardTabType?.All}
        >
          <TabsList className="mb-2">
            {tabs.map((item) => (
              <TabsTrigger
                key={item?.id}
                value={item?.id}
                buttonClassName="ui-justify-center"
              >
                {item?.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs?.map((item) => {
            const Content = DASHBOARD_DISCARD_CONTENT[item?.id]

            return (
              <TabsContent key={item?.id} value={item?.id}>
                <Content ref={ref} filter={filter?.query} enabled={enabled} />
              </TabsContent>
            )
          })}
        </TabsRoot>
      </div>
    </Container>
  )
}
