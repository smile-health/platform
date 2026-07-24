import React from 'react'
import { ButtonIcon } from '#components/button-icon'
import { BarChart, MapChart } from '#components/chart'
import { H5 } from '#components/heading'
import BurgerIcon from '#components/icons/BurgerIcon'
import GlobeIcon from '#components/icons/GlobeIcon'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { useTranslation } from 'react-i18next'

import DashboardInventoryCustomLegend from '../components/DashboardInventoryCustomLegend'
import {
  DASHBOARD_INVENTORY_LABEL_COLOR,
  DashboardInventoryMapsColor,
  LEGEND_LABELS,
} from '../dashboard-inventory-overview.constant'
import { useDashboardInventoryStore } from '../dashboard-inventory-overview.store'
import {
  TBarChart,
  TCommon,
  TDashboardInventoryOverviewFilter,
  TMapItem,
} from '../dashboard-inventory-overview.type'
import useGetLocation from '../hooks/useGetLocation'

type ClickItem = TCommon & {
  province?: TCommon
  regency?: TCommon
}

type TEntityBarChart = TBarChart<{
  province: TCommon
  regency: TCommon
}>

type Props = Readonly<{
  onClick: (item: ClickItem) => void
  filter: TDashboardInventoryOverviewFilter
}>

export default function DashboardInventoryLocation({ onClick, filter }: Props) {
  const { t } = useTranslation('dashboardInventoryOverview')
  const { map, view, setView } = useDashboardInventoryStore()
  const { data, color, isLoading } = useGetLocation({ filter })

  const handleListLocationClick = (item: TBarChart<ClickItem>) => {
    onClick({
      id: item?.extra?.id,
      name: item?.extra?.name,
      province: item?.extra?.province,
      regency: item?.extra?.regency,
    })
  }

  const handleEntityClick = (item: TEntityBarChart) => {
    onClick({
      id: item?.extra?.regency?.id
        ? item?.extra?.regency?.id
        : item?.extra?.province?.id,
      name: item?.extra?.regency?.name
        ? item?.extra?.regency?.name
        : item?.extra?.province?.name,
      ...(item?.extra?.regency?.id && {
        province: {
          id: item?.extra?.province?.id,
          name: item?.extra?.province?.name,
        },
      }),
    })
  }

  const isEmpty =
    view === 'map' || view === 'list'
      ? !map?.data?.length
      : !data?.entities?.length

  return (
    <DashboardBox.Root
      id="location-map"
      className="ui-flex ui-flex-col ui-h-full"
    >
      <DashboardBox.Header bordered>
        <H5>{t('title.location')}</H5>
        <div className="ui-absolute ui-right-4 ui-top-1 ui-flex ui-gap-1 ui-ml-auto">
          {map?.type !== 'entity' && (
            <ButtonIcon
              size="md"
              onClick={() => setView('map')}
              variant={view === 'map' ? 'outline' : 'default'}
            >
              <GlobeIcon className="ui-size-5" />
            </ButtonIcon>
          )}
          <ButtonIcon
            size="md"
            onClick={() => setView('list')}
            variant={view === 'list' ? 'outline' : 'default'}
          >
            <BurgerIcon className="ui-size-5" />
          </ButtonIcon>
        </div>
      </DashboardBox.Header>
      <DashboardBox.Body className="ui-flex-1 ui-flex ui-flex-col">
        <DashboardBox.Config
          download={{
            targetElementId: 'location-map',
            fileName: 'Dashboard Inventory - Location',
          }}
        />
        <DashboardBox.Content
          isEmpty={isEmpty}
          isLoading={
            map?.isLoading ||
            isLoading ||
            (!isEmpty && map?.type === 'location' && !map?.name)
          }
          className="ui-flex-1 ui-min-h-96 ui-max-h-[500px]"
        >
          {view === 'map' && (
            <MapChart<TMapItem>
              location={map?.name}
              data={(map?.data as TMapItem[]) ?? []}
              color={DashboardInventoryMapsColor?.[map?.color]}
              onClick={onClick}
            />
          )}

          {view === 'list' && (
            <div className="ui-space-y-4">
              {(filter?.material?.length ?? 0) > 1 && (
                <div className="ui-flex ui-items-center ui-justify-center ui-gap-4">
                  {LEGEND_LABELS?.map((legend, index) => (
                    <DashboardInventoryCustomLegend
                      key={legend}
                      colorClass={color?.legend?.[index]}
                      label={legend}
                    />
                  ))}
                </div>
              )}
              <BarChart
                layout="horizontal"
                data={data?.location}
                anchor="center"
                heightContainer={450}
                color={color?.location}
                isDataFormatted={false}
                formatValue={(context) => `${context.x}%`}
                onClick={handleListLocationClick}
                options={{
                  plugins: {
                    datalabels: {
                      display: filter?.material?.length !== 1,
                    },
                  },
                }}
                tooltipFormatter={{
                  label: (context) => {
                    const item = context?.raw as TBarChart

                    return item?.extra?.tooltip?.replace(`${item.y}:`, '')
                  },
                }}
              />
            </div>
          )}

          {view === 'entities' && (
            <BarChart
              layout="horizontal"
              data={data?.entities}
              anchor="center"
              color={DASHBOARD_INVENTORY_LABEL_COLOR[color?.entity]?.color}
              isDataFormatted={false}
              onClick={handleEntityClick}
              tooltipFormatter={{
                label: (context) => {
                  const item = context?.raw as TBarChart

                  return item?.extra?.tooltip
                },
              }}
            />
          )}
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
