import { ReactNode, useEffect, useMemo, useState } from 'react'
import { parseDate } from '@internationalized/date'
import { useFilter, UseFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import DashboardFilter from '#pages/dashboard/components/DashboardFilter'
import DashboardInformation from '#pages/dashboard/components/DashboardInformation'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { TDashboardIOTFilter } from '../../dashboard.type'
import {
  DashboardInventoryTabType,
  getDashboardTabs,
} from '../dashboard-inventory.constant'
import dashboardAbnormalStockFilterSchema from '../schemas/dashboardAbnormalStockFilterSchema'
import dashboardCountStockFilterSchema from '../schemas/dashboardCountStockFilterSchema'
import dashboardFillingStockFilterSchema from '../schemas/dashboardFillingStockFilterSchema'
import dashboardStockAvailabilityFilterSchema from '../schemas/dashboardStockAvailabilityFilterSchema'

type Tab = {
  id: DashboardInventoryTabType
  label: string
}

type Props = Readonly<{
  type:
    | 'abnormal-stock'
    | 'add-remove-stock'
    | 'stock-availability'
    | 'filling-stock'
  onSubmit?: VoidFunction
  onExport?: VoidFunction
  children: (
    tabs: Tab[],
    filter: TDashboardIOTFilter,
    enabled?: boolean
  ) => ReactNode
}>

const filterSchemaMap = {
  'abnormal-stock': dashboardAbnormalStockFilterSchema,
  'add-remove-stock': dashboardCountStockFilterSchema,
  'stock-availability': dashboardStockAvailabilityFilterSchema,
  'filling-stock': dashboardFillingStockFilterSchema,
}

export default function DashboardInventoryContainer({
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
  } = useTranslation('dashboardInventory')

  const { t: tDashboard } = useTranslation('dashboard')

  const filterSchema = useMemo<UseFilter>(
    () => schema(t, tDashboard, language),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tDashboard, language]
  )

  const filter = useFilter(filterSchema)

  const tabs = getDashboardTabs(t, type !== 'add-remove-stock')

  const titleMap = {
    'abnormal-stock': t('title.abnormal'),
    'add-remove-stock': t('title.count'),
    'stock-availability': t('title.availability'),
    'filling-stock': t('title.filling'),
  }

  const informationDescriptionMap = {
    'abnormal-stock': t('description.abnormal'),
    'add-remove-stock': t('description.count'),
    'stock-availability': t('description.availability'),
    'filling-stock': t('description.filling'),
  }

  const informationDetailsMap = {
    'abnormal-stock': t('information.abnormal', {
      returnObjects: true,
    }),
    'add-remove-stock': t('information.count', {
      returnObjects: true,
    }),
    'stock-availability': [],
    'filling-stock': [],
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
          defaultValue={DashboardInventoryTabType?.All}
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
