import { useMemo, useRef, useState } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useQuery } from '@tanstack/react-query'
import { useFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { ProgramEnum } from '#constants/program'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { getProgramStorage } from '#utils/storage/program'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardFilter from '../components/DashboardFilter'
import { handleFilter } from './dashboard-asik.helper'
import DashboardAsikOverview from './components/DashboardAsikOverview'
import {
  DashboardAsikTabType,
  getDashboardAsikTabs,
} from './dashboard-asik.constant'
import { exportDashboardAsik } from './dashboard-asik.service'
import { TImperativeHandle } from './dashboard-asik.type'
import dashboardAsikFilterSchema from './schemas/dashboardAsikFilterSchema'

export default function DashboardAsikPage() {
  usePermission('dashboard-asik-view')

  const program = getProgramStorage()

  const ref = useRef<TImperativeHandle>(null)
  const [enabled, setEnabled] = useState(false)
  const [tab, setTab] = useState<DashboardAsikTabType>(
    DashboardAsikTabType.Vendor
  )

  const isEnableCustomer = useFeatureIsOn('dashboard.asik.customer')

  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardAsik')
  const { t: tDashboard } = useTranslation('dashboard')

  const schema = useMemo(
    () => dashboardAsikFilterSchema(t, tDashboard, language),
    [t, tDashboard, language]
  )

  const filter = useFilter(schema)

  const params = {
    ...handleFilter(filter?.query),
    region: isEnableCustomer ? tab : DashboardAsikTabType.Vendor,
  }

  const {
    refetch: onExport,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['export-dashboad-asik', params],
    queryFn: () => exportDashboardAsik(params),
    enabled: false,
  })

  const onResetPage = () => ref.current?.onResetPage()

  const tabs = getDashboardAsikTabs(t)

  useSetLoadingPopupStore(isLoading || isFetching)

  return (
    <Container title={t('title.page')} withLayout>
      <Meta title={generateMetaTitle(t('title.page'))} />
      <div className="ui-space-y-6">
        <DashboardFilter
          filter={filter}
          onExport={onExport}
          isDisabledSubmit={program?.key !== ProgramEnum.Immunization}
          isValidatingRequiredField
          onSubmit={() => {
            onResetPage()
            setTimeout(() => {
              setEnabled(true)
            }, 150)
          }}
        />
        {
          <TabsRoot
            variant="pills"
            align="center"
            defaultValue={DashboardAsikTabType?.Vendor}
          >
            {isEnableCustomer ? (
              <TabsList className="mb-2">
                {tabs.map((item) => (
                  <TabsTrigger
                    key={item?.id}
                    value={item?.id}
                    buttonClassName="ui-justify-center"
                    onClick={() => setTab(item?.id)}
                  >
                    {item?.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            ) : (
              <DashboardAsikOverview
                filter={filter?.query}
                region={DashboardAsikTabType.Vendor}
                enabled={enabled}
              />
            )}

            {isEnableCustomer &&
              tabs?.map((item) => {
                return (
                  <TabsContent key={item?.id} value={item?.id}>
                    <DashboardAsikOverview
                      filter={filter?.query}
                      region={item?.id}
                      enabled={enabled}
                    />
                  </TabsContent>
                )
              })}
          </TabsRoot>
        }
      </div>
    </Container>
  )
}
