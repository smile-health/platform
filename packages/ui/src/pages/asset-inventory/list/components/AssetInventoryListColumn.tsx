import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { BOOLEAN } from '#constants/common'
import dayjs from 'dayjs'

import { thousandFormatter } from '../libs/asset-inventory-list.common'
import {
  TAssetInventory,
  TAssetMainColumn,
} from '../libs/asset-inventory-list.types'
import AssetInventoryDetailButton from './AssetInventoryDetailButton'
import AssetInventoryTitleBlock from './AssetInventoryTitleBlock'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

import { Badge } from '#components/badge'
import AssetManagementsFieldWithOtherOption from '#pages/asset-managements/components/AssetManagementsFieldWithOtherOption'
import { hasPermission } from '#shared/permission/index'

import { useAssetInventoryForm } from '../../form/hooks/useAssetInventoryForm'
import { WorkingStatusEnum } from '../../form/libs/asset-inventory-constant'
import AssetInventoryEditButton from './AssetInventoryEditButton'

export const AssetInventoryMainColumn = ({
  t,
  language,
  page,
  paginate,
}: TAssetMainColumn) => {
  const { workingStatus } = useAssetInventoryForm({ data: null })

  const schema: Array<ColumnDef<TAssetInventory>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      cell: ({ row: { index } }) =>
        thousandFormatter({
          value: ((page ?? 0) - 1) * (paginate ?? 0) + (index + 1),
          locale: language,
        }),
    },
    {
      header: t('assetInventory:columns.serial_number'),
      accessorKey: 'serial_number',
      enableSorting: true,
      size: 400,
      minSize: 400,
      meta: {
        cellClassName: 'ui-content-start',
      },
      cell: ({
        row: {
          original: {
            serial_number,
            asset_model,
            manufacture,
            regency,
            entity,
            province,
            other_asset_model_name,
            other_manufacture_name,
          },
        },
      }) => {
        const assetModelName = asset_model?.name
          ? ` - ${asset_model?.name}`
          : `- ${other_asset_model_name ?? ''}`
        const manufactureName = manufacture?.name
          ? ` (${manufacture?.name ?? ''})`
          : ` (${other_manufacture_name ?? ''})`
        const provinceRegency = [
          regency?.name ?? undefined,
          province?.name ?? undefined,
        ].filter((item) => item !== undefined)

        return (
          <AssetInventoryTitleBlock
            arrText={[
              {
                label: (
                  <p>
                    <span className="ui-font-bold ui-text-dark-blue">
                      {serial_number}
                    </span>
                    {assetModelName}
                    <span>{manufactureName}</span>
                  </p>
                ),
                className: 'ui-text-sm ui-font-normal ui-text-dark-blue',
              },
              {
                label: entity?.name,
                className:
                  'ui-text-sm ui-font-normal ui-text-dark-blue ui-my-1',
              },
              {
                label:
                  provinceRegency.length > 1
                    ? provinceRegency.join(', ')
                    : provinceRegency[0],
                className: 'ui-text-xs ui-font-thin ui-text-gray-700',
              },
            ]}
          />
        )
      },
    },
    {
      header: t('assetInventory:columns.asset_type.label'),
      accessorKey: 'asset_type_name',
      enableSorting: true,
      meta: {
        cellClassName: 'ui-content-start',
      },
      size: 200,
      minSize: 200,
      cell: ({
        row: {
          original: { asset_type, other_asset_type_name },
        },
      }) => (
        <AssetManagementsFieldWithOtherOption
          primaryValue={asset_type?.name}
          otherValue={other_asset_type_name}
          t={t}
          optionKey={t('assetInventory:columns.asset_type.label')}
        />
      ),
    },
    {
      header: t('assetInventory:columns.related_program.label'),
      accessorKey: 'program_name',
      meta: {
        cellClassName: 'ui-content-start',
      },
      size: 200,
      minSize: 200,
      cell: ({
        row: {
          original: { programs },
        },
      }) => {
        return programs?.length > 0
          ? programs?.map((item) => item.name).join(', ')
          : '-'
      },
    },
    {
      header: t('assetInventory:columns.working_status.label'),
      accessorKey: 'working_status',
      meta: {
        cellClassName: 'ui-content-start',
      },
      cell: ({
        row: {
          original: { working_status },
        },
      }) => (
        <Badge
          key={language}
          variant="light"
          rounded="xl"
          color={
            workingStatus?.[working_status?.id as WorkingStatusEnum]?.color
          }
        >
          {working_status?.name}
        </Badge>
      ),
    },
    {
      header: t('assetInventory:columns.status.label'),
      accessorKey: 'status',
      enableSorting: true,
      meta: {
        cellClassName: 'ui-content-start',
      },
      cell: ({
        row: {
          original: { status },
        },
      }) => (
        <>
          {Number(status?.id) === BOOLEAN.TRUE
            ? t('common:status.active')
            : t('common:status.inactive')}
        </>
      ),
    },

    {
      header: t('common:updated_at'),
      accessorKey: 'updated_at',
      enableSorting: true,
      meta: {
        cellClassName: 'ui-min-h-[60px] ui-content-start',
      },
      cell: ({
        row: {
          original: { updated_at, user_updated_by },
        },
      }) => (
        <>
          <p className="ui-font-bold">
            {`${user_updated_by?.firstname ?? ''}
            ${user_updated_by?.lastname ?? ''}`}
          </p>
          <p>
            {dayjs(updated_at)
              .locale(language)
              .format('DD MMM YYYY HH:mm')
              .toUpperCase()}
          </p>
        </>
      ),
    },
    {
      header: t('common:action'),
      accessorKey: 'action',
      size: 150,
      minSize: 150,
      meta: {
        cellClassName: 'ui-content-start',
      },
      cell: ({ row }) => (
        <div className="ui-grid ui-grid-cols-2 ui-gap-2">
          <AssetInventoryDetailButton id={row.original?.id} />
          {hasPermission('asset-inventory-mutate') ? (
            <AssetInventoryEditButton id={row.original?.id} />
          ) : null}
        </div>
      ),
    },
  ]

  return schema
}

export default {}
