'use client'

import { useMutation } from '@tanstack/react-query'
import { Button } from '#components/button'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { Table, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { toast } from '#components/toast'
import { downloadBase64 } from '#utils/download'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { exportEnvironmentalHealthHistoryPdf } from '../environmental-health-history.service'
import {
  EnvironmentalHealthHistoryDetail,
  EnvironmentalHealthHistoryInventoryItem,
} from '../environmental-health-history.type'

const formatDate = (date: string | null | undefined, includeTime = false) => {
  if (!date) return '-'
  return dayjs(date).format(includeTime ? 'DD MMM YYYY, HH:mm' : 'DD MMM YYYY')
}

const formatDynamicValue = (value: unknown): string => {
  if (value == null) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  const str = `${value}`
  if (
    str.length >= 10 &&
    !isNaN(Number(str.charAt(0))) &&
    str.includes('-') &&
    dayjs(str).isValid()
  ) {
    return formatDate(str, false)
  }
  return str
}

const isInventoryArray = (
  value: unknown
): value is EnvironmentalHealthHistoryInventoryItem[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  typeof value[0] === 'object' &&
  value[0] !== null &&
  'model_name' in value[0] &&
  'serial_number' in value[0]

const formatColumnKey = (key: string): string =>
  key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

type EnvironmentalHealthHistoryDetailInfoProps = {
  data?: EnvironmentalHealthHistoryDetail
  isLoading?: boolean
}

function EnvironmentalHealthHistoryDetailInfo(
  props: Readonly<EnvironmentalHealthHistoryDetailInfoProps>
) {
  const { isLoading, data } = props
  const { t } = useTranslation(['common', 'environmentalHealthHistory'])

  const { mutate: onExportPdf, isPending: isExporting } = useMutation({
    mutationFn: (id: number) => exportEnvironmentalHealthHistoryPdf(id),
    onSuccess: (data) => {
      downloadBase64(data.base64, data.filename, data.mimeType)
      toast.success({
        description: t('environmentalHealthHistory:export.pdf') + ' success',
      })
    },
    onError: () => {
      toast.danger({
        description: t('common:message.common.error'),
      })
    },
  })

  const getStatusLabel = (status: string | null | undefined) => {
    if (!status) return '-'
    if (status === 'completed')
      return t('environmentalHealthHistory:filter.status_completed')
    if (status === 'pending')
      return t('environmentalHealthHistory:filter.status_pending')
    return status
  }

  const getSampleCollectedByLabel = (value: string | null | undefined) => {
    if (!value) return '-'
    if (value === 'lab')
      return t('environmentalHealthHistory:filter.sample_collected_by_lab')
    if (value === 'customer')
      return t('environmentalHealthHistory:filter.sample_collected_by_customer')
    return value
  }

  const skeletonRows = Array.from(
    { length: 6 },
    (_, idx) => `skeleton-row-${idx}`
  )

  if (isLoading) {
    return (
      <div className="ui-mt-6 ui-animate-pulse">
        <div className="ui-max-w-4xl ui-mx-auto ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
          <div className="ui-h-6 ui-bg-gray-200 ui-rounded ui-w-1/3 ui-mb-6" />
          <div className="ui-space-y-4">
            {skeletonRows.map((key) => (
              <div
                key={key}
                className="ui-h-4 ui-bg-gray-200 ui-rounded ui-w-full"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="ui-mt-6 ui-text-center ui-text-neutral-500">
        {t('common:message.empty.title')}
      </div>
    )
  }

  const entityDetailData = [
    {
      label: t('environmentalHealthHistory:detail.entity_name'),
      value: data?.entity_name ?? '-',
    },
    {
      label: t('environmentalHealthHistory:detail.entity_address'),
      value: data?.entity_address ?? '-',
    },
  ]

  const sampleDetailData = [
    {
      label: t('environmentalHealthHistory:detail.sample_id'),
      value: data?.sample_id ?? '-',
    },
    {
      label: t('environmentalHealthHistory:detail.lab_result_status'),
      value: getStatusLabel(data?.lab_result_status),
    },
    {
      label: t('environmentalHealthHistory:detail.received_date'),
      value: formatDate(data?.received_date),
    },
    {
      label: t('environmentalHealthHistory:detail.test_start_date'),
      value: formatDate(data?.test_start_date),
    },
    {
      label: t('environmentalHealthHistory:detail.test_end_date'),
      value: formatDate(data?.test_end_date),
    },
    {
      label: t('environmentalHealthHistory:detail.sample_collected_by'),
      value: getSampleCollectedByLabel(data?.sample_collected_by),
    },
    {
      label: t('environmentalHealthHistory:detail.location'),
      value: data?.location ?? '-',
    },
    {
      label: t('environmentalHealthHistory:detail.collection_date'),
      value: formatDate(data?.collection_date),
    },
    {
      label: t('environmentalHealthHistory:detail.parameter_category'),
      value: data?.parameter_category_name ?? '-',
    },
    {
      label: t('environmentalHealthHistory:detail.activities'),
      value: data?.activity_name ?? '-',
    },
    {
      label: t('environmentalHealthHistory:detail.created_at'),
      value: formatDate(data?.created_at, true),
    },
  ]

  const iklDetailData = [
    {
      label: t('environmentalHealthHistory:detail.has_ikl'),
      value: data?.has_ikl
        ? t('environmentalHealthHistory:filter.has_ikl_yes')
        : t('environmentalHealthHistory:filter.has_ikl_no'),
    },
    ...(data?.has_ikl
      ? [
          {
            label: t('environmentalHealthHistory:detail.ikl_test_date'),
            value: formatDate(data?.ikl_test_date),
          },
          {
            label: t('environmentalHealthHistory:detail.ikl_score'),
            value: data?.ikl_score != null ? String(data.ikl_score) : '-',
          },
          {
            label: t('environmentalHealthHistory:detail.is_qualified'),
            value: data?.is_qualified
              ? t('environmentalHealthHistory:detail.qualified')
              : t('environmentalHealthHistory:detail.not_qualified'),
          },
        ]
      : []),
  ]

  // Additional items from parameter_category_items (dynamic fields)
  const additionalItems = data?.parameter_category_items ?? []
  const nonInventoryDetailData = additionalItems
    .filter((item) => !isInventoryArray(item.value))
    .map((item) => ({
      label: item.label,
      value: formatDynamicValue(item.value),
    }))
  const hasAdditionalItems = additionalItems.length > 0

  return (
    <div className="ui-mt-6 ui-space-y-6">
      {/* Entity Info */}
      <div className="ui-max-w-4xl ui-mx-auto ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
        <div className="ui-flex ui-justify-between ui-items-start ui-gap-4 ui-mb-6">
          <div className="ui-font-bold">
            {t('environmentalHealthHistory:detail.entity_info')}
          </div>
          <Button
            id="btn-export-pdf"
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() => {
              if (data?.id) onExportPdf(data.id)
            }}
          >
            {t('environmentalHealthHistory:export.pdf')}
          </Button>
        </div>
        <div className="ui-mt-4">
          <RenderDetailValue data={entityDetailData} />
        </div>
      </div>

      {/* Sample Info */}
      <div className="ui-max-w-4xl ui-mx-auto ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
        <div className="ui-font-bold ui-mb-6">
          {t('environmentalHealthHistory:detail.sample_info')}
        </div>
        <div className="ui-mt-4">
          <RenderDetailValue data={sampleDetailData} />
        </div>
      </div>

      {/* Test Results */}
      {data?.test_results && data.test_results.length > 0 && (
        <div className="ui-max-w-4xl ui-mx-auto ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
          <div className="ui-font-bold ui-mb-6">
            {t('environmentalHealthHistory:detail.test_results')}
          </div>
          <Table withBorder rounded overflowXAuto verticalAlignment="center">
            <Thead>
              <Tr>
                <Th columnKey="no" className="ui-w-16 ui-font-semibold">
                  No.
                </Th>
                <Th columnKey="analysis_parameter" className="ui-font-semibold">
                  {t('environmentalHealthHistory:detail.analysis_parameter')}
                </Th>
                <Th columnKey="test_method" className="ui-font-semibold">
                  {t('environmentalHealthHistory:detail.test_method')}
                </Th>
                <Th columnKey="result" className="ui-font-semibold">
                  {t('environmentalHealthHistory:detail.result')}
                </Th>
                <Th columnKey="quality_standard" className="ui-font-semibold">
                  {t('environmentalHealthHistory:detail.quality_standard')}
                </Th>
                <Th columnKey="unit" className="ui-font-semibold">
                  {t('environmentalHealthHistory:detail.unit')}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.test_results.map((result, index) => (
                <Tr key={result.id}>
                  <Td>{index + 1}</Td>
                  <Td>{result.parameter_name ?? '-'}</Td>
                  <Td>{result.test_methods_name ?? '-'}</Td>
                  <Td>{result.result_value ?? '-'}</Td>
                  <Td>{result.quality_standard ?? '-'}</Td>
                  <Td>{result.unit ?? '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}

      {/* Management Asset Info */}
      {data?.management_asset && (
        <div className="ui-max-w-4xl ui-mx-auto ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
          <div className="ui-font-bold ui-mb-6">
            {t('environmentalHealthHistory:detail.management_asset_info')}
          </div>
          <div className="ui-mt-4">
            <RenderDetailValue
              data={[
                {
                  label: t(
                    'environmentalHealthHistory:detail.asset_model_name'
                  ),
                  value: data.management_asset.model_name ?? '-',
                },
                {
                  label: t(
                    'environmentalHealthHistory:detail.asset_serial_number'
                  ),
                  value: data.management_asset.serial_number ?? '-',
                },
                {
                  label: t(
                    'environmentalHealthHistory:detail.asset_production_year'
                  ),
                  value:
                    data.management_asset.production_year != null
                      ? String(data.management_asset.production_year)
                      : '-',
                },
                {
                  label: t(
                    'environmentalHealthHistory:detail.asset_working_status'
                  ),
                  value: data.management_asset.working_status ?? '-',
                },
                {
                  label: t('environmentalHealthHistory:detail.asset_type_name'),
                  value: data.management_asset.asset_type_name ?? '-',
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* IKL Info */}
      <div className="ui-max-w-4xl ui-mx-auto ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
        <div className="ui-font-bold ui-mb-6">
          {t('environmentalHealthHistory:detail.ikl_info')}
        </div>
        <div className="ui-mt-4">
          <RenderDetailValue data={iklDetailData} />
        </div>
      </div>

      {/* Additional Fields (dynamic parameter category items) */}
      {hasAdditionalItems && (
        <div className="ui-max-w-4xl ui-mx-auto ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-white">
          <div className="ui-font-bold ui-mb-6">
            {t('environmentalHealthHistory:detail.additional_fields')}
          </div>
          <div className="ui-mt-4 ui-space-y-4">
            {/* Non-inventory fields */}
            {nonInventoryDetailData.length > 0 && (
              <RenderDetailValue data={nonInventoryDetailData} />
            )}
            {/* Inventory fields rendered as table */}
            {additionalItems
              .filter((item) => isInventoryArray(item.value))
              .map((item) => (
                <div
                  key={item.id}
                  className="ui-grid ui-grid-cols-[264px_3px_1fr] ui-gap-x-2 ui-items-start"
                >
                  <p className="ui-text-[#787878]">{item.label}</p>
                  <span>:</span>
                  <div>
                    <Table
                      withBorder
                      rounded
                      overflowXAuto
                      verticalAlignment="center"
                    >
                      <Thead>
                        <Tr>
                          {Object.keys(
                            (
                              item.value as EnvironmentalHealthHistoryInventoryItem[]
                            )[0]
                          )
                            .filter((key) => key !== 'id')
                            .map((key) => (
                              <Th
                                key={key}
                                columnKey={key}
                                className="ui-font-semibold"
                              >
                                {formatColumnKey(key)}
                              </Th>
                            ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(
                          item.value as EnvironmentalHealthHistoryInventoryItem[]
                        ).map((inv) => (
                          <Tr key={inv.id}>
                            {Object.entries(inv)
                              .filter(([key]) => key !== 'id')
                              .map(([key, val]) => (
                                <Td key={key}>
                                  {val != null ? String(val) : '-'}
                                </Td>
                              ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EnvironmentalHealthHistoryDetailInfo
