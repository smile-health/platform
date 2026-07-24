import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { H5 } from '#components/heading'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { ProgramEnum } from '#constants/program'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import { parseDateTime } from '#utils/date'
import { getProgramStorage } from '#utils/storage/program'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardBox from '../components/DashboardBox'
import DashboardFilter from '../components/DashboardFilter'
import { DashboardInventoryType } from './dashboard-inventory-overview.constant'
import {
  handleFilter,
  handleMapClick,
} from './dashboard-inventory-overview.helper'
import { getInventoryMaterial } from './dashboard-inventory-overview.service'
import { useDashboardInventoryStore } from './dashboard-inventory-overview.store'
import { TCommon } from './dashboard-inventory-overview.type'
import dashboardInventoryOverviewFilterSchema from './schemas/dashboardInventoryOverviewFilterSchema'
import DashboardInventoryActivityChart from './sections/DashboardInventoryActivityChart'
import DashboardInventoryEMAChart from './sections/DashboardInventoryEMAChart'
import DashboardInventoryLocation from './sections/DashboardInventoryLocation'
import DashboardInventoryMaterial from './sections/DashboardInventoryMaterial'
import DashboardInventoryTemperatureChart from './sections/DashboardInventoryTemperatureChart'

type ClickItem = TCommon & {
  province?: TCommon
  regency?: TCommon
}

export default function DashboardInventoryOverviewPage() {
  usePermission('dashboard-inventory-overview-view')

  const program = getProgramStorage()
  const isImmun = program?.key === ProgramEnum.Immunization

  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardInventoryOverview')

  const { t: tDashboard } = useTranslation('dashboard')

  const filterSchema = useMemo<UseFilter>(
    () => dashboardInventoryOverviewFilterSchema(t, tDashboard, language),
    [t, tDashboard, language]
  )

  const filter = useFilter(filterSchema)

  const router = useSmileRouter()

  const {
    title,
    status,
    enabled,
    map,
    lastUpdated,
    transactionType,
    setEnabled,
    setTransactionType,
    setMaterialId,
  } = useDashboardInventoryStore()

  const params = handleFilter({
    ...filter?.query,
    transaction_type: transactionType as DashboardInventoryType,
  })

  const {
    data: dataMaterial,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['inventory-material', params],
    queryFn: () => getInventoryMaterial(params),
    staleTime: 0,
    enabled: !!params?.transaction_type,
  })

  const onMapClick = (item: ClickItem) => {
    handleMapClick({
      item,
      setValue: filter.setValue,
      mapType: map?.type,
      getAsLink: router.getAsLink,
      type: transactionType,
      source: map.source,
      filter: filter?.query,
      onCallback: filter.handleSubmit,
    })
  }

  return (
    <Container title={t('title.page')} withLayout>
      <Meta title={generateMetaTitle(t('title.page'))} />
      <DashboardBox.Provider
        filter={filter?.query}
        colorClass="ui-bg-white"
        showRegion={false}
      >
        <DashboardFilter
          filter={filter}
          onSubmit={() => {
            setTransactionType(null)
            setMaterialId(null)
            setTimeout(() => {
              window.scrollTo({ top: 400, behavior: 'smooth' })
              if (!enabled) setEnabled(true)
            }, 150)
          }}
          filteredTime={{
            label: t('last_updated_at'),
            value: parseDateTime(lastUpdated),
          }}
        />
        <div
          className={cx('ui-grid ui-gap-4', {
            'ui-grid-cols-1': !isImmun,
            'ui-grid-cols-2': isImmun,
          })}
        >
          <DashboardInventoryEMAChart filter={filter?.query} />
          {isImmun && (
            <DashboardInventoryTemperatureChart filter={filter?.query} />
          )}
        </div>
        <DashboardInventoryActivityChart filter={filter?.query} />
        {filter?.query?.regency?.value &&
        map?.source === 'temperature' ? null : (
          <DashboardBox.Root id="location-material">
            <DashboardBox.Header bordered>
              <H5>{title}</H5>
            </DashboardBox.Header>
            <DashboardBox.Body>
              <DashboardBox.Content className="ui-space-y-4">
                <p className="ui-space-x-2 ui-text-center">
                  <span className="ui-text-xs">
                    <strong>Status</strong>: {status}
                  </span>
                  <span className="ui-text-xs">
                    <strong>Tag</strong>:{' '}
                    {filter?.query?.entity_tag?.label ?? t('all')}
                  </span>
                </p>
                <div className="ui-grid ui-grid-cols-5 ui-gap-4">
                  <div
                    className={cx('ui-col-span-3', {
                      'ui-col-start-2': !params?.transaction_type,
                    })}
                  >
                    <DashboardInventoryLocation
                      filter={filter?.query}
                      onClick={onMapClick}
                    />
                  </div>
                  {!!params?.transaction_type && (
                    <div className="ui-col-span-2">
                      <DashboardInventoryMaterial
                        data={dataMaterial?.data ?? []}
                        isLoading={isLoading || isFetching}
                      />
                    </div>
                  )}
                </div>
              </DashboardBox.Content>
            </DashboardBox.Body>
          </DashboardBox.Root>
        )}
      </DashboardBox.Provider>
    </Container>
  )
}
