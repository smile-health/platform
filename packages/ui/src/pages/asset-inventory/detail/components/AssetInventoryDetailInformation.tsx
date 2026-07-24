import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import AssetDetailContext from '../libs/asset-inventory-detail.context'

import 'dayjs/locale/en'
import 'dayjs/locale/id'

import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from '#components/accordion'
import { Badge } from '#components/badge'
import {
  DataPair,
  RenderDetailValue,
} from '#components/modules/RenderDetailValue'
import { HumidityThreshold } from '#services/asset-type'
import { hasPermission } from '#shared/permission/index'
import { parseDateTime } from '#utils/date'
import { formatPhoneNumber, numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import { useAssetInventoryForm } from '../../form/hooks/useAssetInventoryForm'
import { WorkingStatusEnum } from '../../form/libs/asset-inventory-constant'
import { WorkingStatusOption } from '../../form/libs/asset-inventory-form.type'
import AssetInventoryTitleBlock from '../../list/components/AssetInventoryTitleBlock'
import { TAssetInventory } from '../../list/libs/asset-inventory-list.types'
import { OWNERSHIP_STATUS } from '../libs/asset-inventory-detail.constant'
import AssetInventoryDetailChangeStatusButton from './AssetInventoryDetailChangeStatusButton'
import AssetInventoryDetailDeleteAssetButton from './AssetInventoryDetailDeleteAssetButton'
import AssetInventoryDetailEditButton from './AssetInventoryDetailEditButton'
import AssetInventoryDetailThresholdTable from './AssetInventoryDetailThresholdTable'

export type DetailInformationType =
  | 'detail-information'
  | 'entity'
  | 'ownership'
  | 'budget'
  | 'electricity'
  | 'warranty'
  | 'calibration'
  | 'maintenance'

export type AssetInventoryDetailInformationProps = {
  type: DetailInformationType
  sections?: DetailInformationType[]
  isLoading?: boolean
  permissions?: Record<string, boolean>
}

const renderFieldWithOtherOption = (
  primaryValue: string | null | React.ReactNode | undefined,
  otherValue: string | null | undefined,
  t: TFunction<['common', 'assetInventory']>,
  optionKey: any
) => (
  <p>
    {primaryValue ?? otherValue ?? null}{' '}
    <span className="ui-text-[#737373]">
      {primaryValue
        ? ''
        : t('assetInventory:columns.other_option', {
            option: t(optionKey),
          })}
    </span>
  </p>
)

const getAssetDetailInformation = (
  data: TAssetInventory | null,
  t: TFunction<['common', 'assetInventory']>,
  language: string,
  workingStatus: Record<WorkingStatusEnum, WorkingStatusOption>,
  permissions?: Record<string, boolean>
) => {
  const {
    asset_type,
    asset_model,
    working_status,
    pqs_code,
    other_asset_type_name,
    manufacture,
    serial_number,
    production_year,
    other_asset_model_name,
    other_manufacture_name,
    status,
    other_gross_capacity,
    other_net_capacity,
    other_max_temperature,
    other_min_temperature,
    programs,
  } = data ?? {}

  const handleOtherCapacityThresholdValue = (
    valueMin: number | null | undefined,
    valueMax: number | null | undefined,
    isCapacity: boolean,
    language: string
  ) => {
    const celcius = '°C'
    const hasData = valueMax && valueMin
    return !hasData ? (
      '-'
    ) : (
      <p>
        {`${isCapacity ? t('assetInventory:capacity.netto_capacity') : t('assetInventory:temperature_logger.minimum')}: ${numberFormatter(valueMin, language)} ${isCapacity ? t('common:litre') : celcius}, ${isCapacity ? t('assetInventory:capacity.gross_capacity') : t('assetInventory:temperature_logger.maximum')}: ${numberFormatter(valueMax, language)} ${isCapacity ? t('common:litre') : celcius}`}{' '}
        <span className="ui-text-[#737373]">
          {`(${
            isCapacity
              ? t('assetInventory:other_inputs.other_asset_capacity')
              : t(
                  'assetInventory:other_inputs.other_asset_temperature_threshold'
                )
          })`}
        </span>
      </p>
    )
  }
  return [
    {
      label: t('assetInventory:columns.asset_type.label'),
      value: renderFieldWithOtherOption(
        asset_type?.name,
        other_asset_type_name,
        t,
        'assetInventory:columns.asset_type.label'
      ),
    },
    {
      label: t('assetInventory:columns.temperature_threshold'),
      value: renderFieldWithOtherOption(
        asset_type?.temperature_thresholds?.length ? (
          <AssetInventoryDetailThresholdTable
            tableHead={[
              t('assetInventory:temperature_logger.minimum'),
              t('assetInventory:temperature_logger.maximum'),
            ]}
            type="temperature_threshold"
            data={asset_type?.temperature_thresholds}
          />
        ) : (
          (handleOtherCapacityThresholdValue(
            other_min_temperature,
            other_max_temperature,
            false,
            language
          ) ?? '-')
        ),
        other_max_temperature?.toString(),
        t,
        'assetInventory:columns.temperature_threshold'
      ),
    },
    {
      label: t('assetInventory:columns.humidity_threshold'),
      value: asset_type?.humidity_thresholds?.length ? (
        <AssetInventoryDetailThresholdTable
          tableHead={[
            t('assetInventory:humidity_logger.minimum'),
            t('assetInventory:humidity_logger.maximum'),
          ]}
          type="humidity_threshold"
          data={asset_type?.humidity_thresholds as HumidityThreshold[]}
        />
      ) : (
        '-'
      ),
    },
    {
      label: t('assetInventory:columns.asset_model_name'),
      value: renderFieldWithOtherOption(
        asset_model?.name,
        other_asset_model_name,
        t,
        'assetInventory:columns.asset_model_name'
      ),
    },
    {
      label: t('assetInventory:columns.capacity'),
      value: renderFieldWithOtherOption(
        asset_model?.capacities?.length ? (
          <AssetInventoryDetailThresholdTable
            tableHead={[
              t('assetInventory:capacity.netto_capacity'),
              t('assetInventory:capacity.gross_capacity'),
            ]}
            type="capacity"
            data={asset_model?.capacities}
          />
        ) : (
          (handleOtherCapacityThresholdValue(
            other_gross_capacity,
            other_net_capacity,
            true,
            language
          ) ?? '-')
        ),
        other_gross_capacity?.toString(),
        t,
        'assetInventory:columns.capacity'
      ),
    },
    {
      label: t('assetInventory:columns.pqs_code'),
      value: pqs_code?.code ?? '-',
    },
    {
      label: t('assetInventory:columns.manufacture.label'),
      value: renderFieldWithOtherOption(
        manufacture?.name,
        other_manufacture_name,
        t,
        'assetInventory:columns.manufacture.label'
      ),
    },
    {
      label: t('assetInventory:columns.serial_number'),
      value: serial_number ?? '-',
    },
    {
      label: t('assetInventory:columns.production_year'),
      value: production_year ?? '-',
    },
    {
      label: t('assetInventory:columns.status.label'),
      value: status?.name ?? '-',
    },
    {
      label: t('assetInventory:columns.working_status.label'),
      value: (
        <Badge
          key={language}
          variant="light"
          rounded="xl"
          className="ui-p-2"
          color={
            workingStatus?.[working_status?.id as WorkingStatusEnum]?.color
          }
        >
          {working_status?.name}
        </Badge>
      ),
    },
    ...(permissions?.enable_program_ids
      ? [
          {
            label: t('assetInventory:columns.related_program.label'),
            value: programs?.length
              ? programs?.map((item) => item.name)?.join(', ')
              : '-',
          },
        ]
      : []),
  ]
}

const getEntityDetailInformation = (
  data: TAssetInventory | null,
  t: TFunction<['common', 'assetInventory']>
) => {
  const { entity, contact_persons } = data ?? {}
  return [
    {
      label: t('assetInventory:columns.entity'),
      value: entity?.name ?? '-',
    },
    ...(contact_persons?.map((item: any, index: number) => ({
      label: t('assetInventory:columns.contact_person.label', {
        number: index + 1,
      }),
      value: `${item?.name ?? '-'} (${formatPhoneNumber(item?.phone) ?? '-'})`,
    })) ?? []),
  ]
}

const getOwnershipDetailInformation = (
  data: TAssetInventory | null,
  t: TFunction<['common', 'assetInventory']>
) => {
  const { ownership, borrowed_from, other_borrowed_from_entity_name } =
    data ?? {}
  return [
    {
      label: t('assetInventory:ownership.status'),
      value: ownership?.name ?? '-',
    },
    {
      label: t('assetInventory:columns.borrowed_from'),
      value: (
        <p>
          {borrowed_from?.name ?? other_borrowed_from_entity_name ?? null}{' '}
          <span className="ui-text-[#737373]">
            {(() => {
              if (borrowed_from?.name) {
                return ''
              }
              if (other_borrowed_from_entity_name) {
                return t('assetInventory:columns.other_option', {
                  option: t('assetInventory:columns.entity'),
                })
              }
              return '-'
            })()}
          </span>
        </p>
      ),
    },
    ...(typeof ownership?.qty === 'number'
      ? [
          {
            label: t('assetInventory:columns.owned_amount.label', {
              type:
                Number(ownership?.id) === OWNERSHIP_STATUS.OWNED
                  ? t('assetInventory:columns.owned_amount.type.owned')
                  : t('assetInventory:columns.owned_amount.type.borrowed'),
            }),
            value: ownership?.qty ?? '-',
          },
        ]
      : []),
  ]
}

const getBudgetDetailInformation = (
  data: TAssetInventory | null,
  t: TFunction<['common', 'assetInventory']>
) => {
  const { budget_source, other_budget_source_name } = data ?? {}
  return [
    {
      label: t('assetInventory:columns.budget_year'),
      value: budget_source?.year ?? '-',
    },
    {
      label: t('assetInventory:columns.budget_source'),
      value: renderFieldWithOtherOption(
        budget_source?.name,
        other_budget_source_name,
        t,
        'assetInventory:columns.budget_source'
      ),
    },
  ]
}

const getElectricityDetailInformation = (
  data: TAssetInventory | null,
  t: TFunction<['common', 'assetInventory']>
) => {
  const { electricity } = data ?? {}
  return [
    {
      label: t('assetInventory:columns.electricity'),
      value: electricity?.name ?? '-',
    },
  ]
}

const getWarrantyDetailInformation = (
  data: TAssetInventory | null,
  t: TFunction<['common', 'assetInventory']>
) => {
  const { warranty } = data ?? {}
  return [
    {
      label: t('assetInventory:columns.warranty.start_date'),
      value:
        parseDateTime(warranty?.start_date, 'DD MMM YYYY').toUpperCase() ?? '-',
    },
    {
      label: t('assetInventory:columns.warranty.end_date'),
      value:
        parseDateTime(warranty?.end_date, 'DD MMM YYYY').toUpperCase() ?? '-',
    },
    {
      label: t('assetInventory:columns.smile_vendor'),
      value: warranty?.asset_vendor_name ?? '-',
    },
  ]
}

const getCalibrationDetailInformation = (
  data: TAssetInventory | null,
  t: TFunction<['common', 'assetInventory']>
) => {
  const { calibration } = data ?? {}
  return [
    {
      label: t('assetInventory:columns.calibration.last_calibration_date'),
      value:
        parseDateTime(calibration?.last_date, 'DD MMM YYYY').toUpperCase() ??
        '-',
    },
    {
      label: t('assetInventory:columns.calibration.schedule.label'),
      value: calibration?.name ?? '-',
    },
    {
      label: t('assetInventory:columns.smile_vendor'),
      value: calibration?.asset_vendor_name ?? '-',
    },
  ]
}

const getMaintenanceDetailInformation = (
  data: TAssetInventory | null,
  t: TFunction<['common', 'assetInventory']>
) => {
  const { maintenance } = data ?? {}
  return [
    {
      label: t('assetInventory:columns.maintenance.last_maintenance_date'),
      value:
        parseDateTime(maintenance?.last_date, 'DD MMM YYYY').toUpperCase() ??
        '-',
    },
    {
      label: t('assetInventory:columns.maintenance.schedule.label'),
      value: maintenance?.name ?? '-',
    },
    {
      label: t('assetInventory:columns.smile_vendor'),
      value: maintenance?.asset_vendor_name ?? '-',
    },
  ]
}

const getDetailInformationByType = (
  detailType: DetailInformationType | undefined,
  data: TAssetInventory | null,
  t: TFunction<['common', 'assetInventory']>,
  language: string,
  workingStatus: Record<WorkingStatusEnum, WorkingStatusOption>,
  permissions?: Record<string, boolean>
) => {
  const detailMap = {
    entity: {
      title: t('assetInventory:form.title.entity'),
      data: getEntityDetailInformation(data, t),
    },
    ownership: {
      title: t('assetInventory:form.title.ownership'),
      data: getOwnershipDetailInformation(data, t),
    },
    budget: {
      title: t('assetInventory:form.title.budget'),
      data: getBudgetDetailInformation(data, t),
    },
    electricity: {
      title: t('assetInventory:form.title.electricity'),
      data: getElectricityDetailInformation(data, t),
    },
    warranty: {
      title: t('assetInventory:form.title.warranty'),
      data: getWarrantyDetailInformation(data, t),
    },
    calibration: {
      title: t('assetInventory:form.title.calibration'),
      data: getCalibrationDetailInformation(data, t),
    },
    maintenance: {
      title: t('assetInventory:form.title.maintenance'),
      data: getMaintenanceDetailInformation(data, t),
    },
  }

  return (
    detailMap[detailType as keyof typeof detailMap] || {
      title: null,
      data: getAssetDetailInformation(
        data,
        t,
        language,
        workingStatus,
        permissions
      ),
    }
  )
}

const AssetInventoryDetailInformation: React.FC<
  AssetInventoryDetailInformationProps
> = ({ type, isLoading, sections, permissions }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'assetInventory'])
  const { data } = useContext(AssetDetailContext)
  const { workingStatus } = useAssetInventoryForm({ data: null })

  const assetModelName = data?.asset_model
    ? ` - ${data?.asset_model?.name ?? data?.other_asset_model_name ?? ''}`
    : ''
  const manufactureName = data?.manufacture
    ? ` - (${data?.manufacture?.name ?? data?.other_manufacture_name ?? ''})`
    : ''

  const formatRegionProvinceLabel = (
    regencyName?: string,
    provinceName?: string
  ): string => {
    if (regencyName && provinceName) return `${regencyName}, ${provinceName}`
    if (regencyName) return regencyName
    if (provinceName) return provinceName
    return ''
  }

  const detailValue = (detailType?: DetailInformationType) =>
    getDetailInformationByType(
      detailType,
      data,
      t,
      language,
      workingStatus,
      permissions
    )

  return (
    <div>
      <div className="ui-my-6 ui-border ui-border-gray-300 ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-4 ui-mx-auto">
          {type === 'detail-information' && (
            <div className="ui-flex ui-flex-row ui-justify-between ui-items-center ui-mt-4 ui-px-4">
              <AssetInventoryTitleBlock
                arrText={[
                  {
                    label: `${data?.serial_number}${assetModelName}${manufactureName}`,
                    className: 'ui-text-sm ui-font-bold ui-text-dark-teal',
                  },
                  {
                    label: data?.entity?.name as string,
                    className:
                      'ui-text-sm ui-font-normal ui-text-dark-teal ui-my-1',
                  },
                  {
                    label: formatRegionProvinceLabel(
                      data?.regency?.name,
                      data?.province?.name
                    ),
                    className:
                      'ui-text-sm ui-font-normal ui-text-gray-400 ui-my-1',
                  },
                ]}
              />
              {hasPermission('asset-inventory-mutate') ? (
                <div className="ui-flex ui-justify-center ui-items-center ui-gap-4">
                  <p className="ui-text-[#737373]">
                    {`${parseDateTime(data?.updated_at, 'DD/MM/YY HH:mm')} ${t('common:by')} ${data?.user_updated_by?.firstname ?? ''} ${data?.user_updated_by?.lastname ?? ''}`}
                  </p>
                  <div className="ui-grid ui-grid-cols-3 ui-mt-4 ui-gap-4">
                    <AssetInventoryDetailDeleteAssetButton />
                    {!isLoading ? (
                      <AssetInventoryDetailChangeStatusButton />
                    ) : null}
                    <AssetInventoryDetailEditButton />
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <div className="ui-font-bold ui-text-primary ui-text-dark-blue">
            {detailValue(type)?.title}
          </div>
          <div className="ui-px-4 ui-mb-">
            <RenderDetailValue data={detailValue(type)?.data as DataPair[]} />
          </div>
          <hr />
          <AccordionRoot className="!ui-p-0" type="single" collapsible>
            <AccordionItem value="additional-form" className="ui-border-none">
              <AccordionTrigger className="!ui-border-t-2 ui-px-4 ui-text-dark-blue ui-font-bold focus:!ui-border-none !ui-ring-transparent hover:ui-bg-transparent">
                {t('assetInventory:detail.more_details')}
              </AccordionTrigger>
              <AccordionContent className="ui-mx-4">
                {sections?.map((item) => {
                  if (item === 'detail-information') {
                    return null
                  }
                  return (
                    <div
                      className="ui-mb-4 ui-border ui-border-gray-300 ui-rounded ui-p-4"
                      key={item}
                    >
                      <div className="ui-font-bold ui-text-primary ui-text-dark-blue  ui-mb-4">
                        {detailValue(item)?.title}
                      </div>
                      <RenderDetailValue
                        data={detailValue(item)?.data as DataPair[]}
                      />
                    </div>
                  )
                })}
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </div>
      </div>
    </div>
  )
}

export default AssetInventoryDetailInformation
