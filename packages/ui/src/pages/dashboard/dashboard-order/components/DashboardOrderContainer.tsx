import { ReactNode, useEffect, useMemo, useState } from 'react'
import { parseDate } from '@internationalized/date'
import { UseFilter, useFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import DashboardFilter from '#pages/dashboard/components/DashboardFilter'
import DashboardInformation from '#pages/dashboard/components/DashboardInformation'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { TDashboardIOTFilter } from '../../dashboard.type'
import {
  DashboardOrderTabType,
  getDashboardTabs,
} from '../dashboard-order.constant'
import dashboardConsumptionSupplyFilterSchema from '../schemas/dashboardConsumptionSupplyFilterSchema'
import dashboardOrderDifferenceFilterSchema from '../schemas/dashboardOrderDifferenceFilterSchema'
import dashboardOrderResponseTimeFilterSchema from '../schemas/dashboardOrderResponseTimeFilterSchema'

type Tab = {
  id: DashboardOrderTabType
  label: string
}

type Props = Readonly<{
  type: 'order-response' | 'order-difference' | 'consumption-supply'
  onSubmit?: VoidFunction
  onExport?: VoidFunction
  children: (
    tabs: Tab[],
    filter: TDashboardIOTFilter,
    enabled?: boolean
  ) => ReactNode
}>

const filterSchemaMap = {
  'order-response': dashboardOrderResponseTimeFilterSchema,
  'order-difference': dashboardOrderDifferenceFilterSchema,
  'consumption-supply': dashboardConsumptionSupplyFilterSchema,
}

export default function DashboardOrderContainer({
  type,
  onSubmit,
  onExport,
  children,
}: Props) {
  const [showInformation, setShowInformation] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const schema = filterSchemaMap[type]

  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardOrder')

  const { t: tDashboard } = useTranslation('dashboard')

  const filterSchema = useMemo<UseFilter>(
    () => schema(t, tDashboard, language),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tDashboard, language]
  )
  const filter = useFilter(filterSchema)

  const tabs = getDashboardTabs(t)

  const titleMap = {
    'order-response': t('title.response_time'),
    'order-difference': t('title.order_difference'),
    'consumption-supply': t('title.consumption_supply'),
  }

  const informationDescriptionMap = {
    'order-response': t('description.response_time'),
    'order-difference': t('description.order_difference'),
    'consumption-supply': t('description.consumption_supply'),
  }

  const informationDetailsMap = {
    'order-response': t('information.response_time', {
      returnObjects: true,
    }),
    'order-difference': t('information.order_difference', {
      returnObjects: true,
    }),
    'consumption-supply': t('information.consumption_supply', {
      returnObjects: true,
    }),
  }

  const title = titleMap[type]
  const informationDescription = informationDescriptionMap[type]
  const informationDetails = informationDetailsMap[type]

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
      title={title}
      withLayout
      showInformation
      onClickInformation={() => setShowInformation(true)}
    >
      <Meta title={generateMetaTitle(title)} />
      <DashboardInformation
        title={title}
        open={showInformation}
        setOpen={setShowInformation}
        description={informationDescription}
        details={informationDetails as string[]}
      />
      <div className="ui-space-y-6">
        <DashboardFilter
          filter={filter}
          isDisabledSubmit={isDisabled}
          onExport={onExport}
          onSubmit={() => {
            if (onSubmit) onSubmit()
            setTimeout(() => {
              setEnabled(true)
            }, 150)
          }}
        />
        <TabsRoot
          variant="pills"
          align="center"
          defaultValue={DashboardOrderTabType?.All}
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
          {children(tabs, filter?.query, enabled)}
        </TabsRoot>
      </div>
    </Container>
  )
}
