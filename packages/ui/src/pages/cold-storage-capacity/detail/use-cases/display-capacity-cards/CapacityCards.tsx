'use client'

import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { Skeleton } from '#components/skeleton'
import { useTranslation } from 'react-i18next'

import { getCapacityColor } from '../../../cold-storage-capacity.utils'
import { useColdStorageCapacityDetail } from '../../ColdStorageCapacityDetailContext'

type CapacityCardProps = {
  title: string
  children: React.ReactNode
}

function CapacityCard({ title, children }: CapacityCardProps) {
  return (
    <div className="ui-flex-1 ui-rounded ui-border ui-border-gray-200 ui-bg-white ui-p-4">
      <h3 className="ui-mb-4 ui-font-semibold ui-text-gray-900">{title}</h3>
      <div className="ui-divide-y ui-divide-gray-100">{children}</div>
    </div>
  )
}

export default function CapacityCards() {
  const { t } = useTranslation('coldStorageCapacity')
  const { data, isLoading } = useColdStorageCapacityDetail()

  if (isLoading) {
    return (
      <div className="ui-flex ui-gap-6">
        <div className="ui-flex-1 ui-animate-pulse ui-rounded ui-border ui-border-gray-200 ui-bg-white ui-p-4">
          <div className="ui-mb-4 ui-h-6 ui-w-48 ui-rounded ui-bg-gray-200" />
          <div className="ui-space-y-3">
            <Skeleton className="ui-h-4 ui-w-full ui-rounded ui-bg-gray-200" />
            <Skeleton className="ui-h-4 ui-w-full ui-rounded ui-bg-gray-200" />
            <Skeleton className="ui-h-4 ui-w-full ui-rounded ui-bg-gray-200" />
          </div>
        </div>
        <div className="ui-flex-1 ui-animate-pulse ui-rounded ui-border ui-border-gray-200 ui-bg-white ui-p-4">
          <div className="ui-mb-4 ui-h-6 ui-w-48 ui-rounded ui-bg-gray-200" />
          <div className="ui-space-y-3">
            <Skeleton className="ui-h-4 ui-w-full ui-rounded ui-bg-gray-200" />
            <Skeleton className="ui-h-4 ui-w-full ui-rounded ui-bg-gray-200" />
            <Skeleton className="ui-h-4 ui-w-full ui-rounded ui-bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-flex ui-gap-6">
      <CapacityCard title={t('detail.realCapacity.title')}>
        <RenderDetailValue
          data={[
            {
              label: t('detail.realCapacity.totalVolumeStock'),
              value: data?.real_capacity.total_volume_stock,
            },
            {
              label: t('detail.realCapacity.assetNetoCapacity'),
              value: data?.real_capacity.asset_neto_capacity,
            },
            {
              label: t('detail.realCapacity.usedPercentage'),
              value: `${data?.real_capacity.used_percentage}%`,
              valueClassName: getCapacityColor(
                data?.real_capacity.used_percentage ?? 0
              ),
            },
          ]}
          loading={isLoading}
          skipEmptyValue={false}
        />
      </CapacityCard>

      <CapacityCard title={t('detail.projectedCapacity.title')}>
        <RenderDetailValue
          data={[
            {
              label: t('detail.projectedCapacity.totalStockVolume'),
              value: data?.projected_capacity.total_stock_volume,
            },
            {
              label: t('detail.projectedCapacity.assetNettoCapacity'),
              value: data?.projected_capacity.asset_netto_capacity ?? 0,
            },
            {
              label: t('detail.projectedCapacity.percentageUsed'),
              value: `${data?.projected_capacity.percentage_used}%`,
              valueClassName: getCapacityColor(
                data?.projected_capacity.percentage_used ?? 0
              ),
            },
          ]}
          loading={isLoading}
          skipEmptyValue={false}
          className="ui-grid-cols-[300px_3px_1fr]"
          labelsClassName="ui-text-nowrap ui-whitespace-nowrap"
        />
      </CapacityCard>
    </div>
  )
}
