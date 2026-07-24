import { useContext } from 'react'
import { ColumnDef } from '@tanstack/react-table'

import { thousandFormatter } from '../libs/asset-list.common'
import AssetListContext from '../libs/asset-list.context'
import { TAssetData, TAssetMainColumn } from '../libs/asset-list.types'
import AssetDegreeManagement from './AssetDegreeManagement'
import AssetDetailButton from './AssetDetailButton'
import AssetListDeviceStatusBox from './AssetListDeviceStatusBox'
import AssetTitleBlock from './AssetTitleBlock'

export const MainColumn = ({ t, language }: TAssetMainColumn) => {
  const { viewTemperatureLogger } = useContext(AssetListContext)

  const deviceWorkingStatusColumn: ColumnDef<TAssetData> = viewTemperatureLogger
    ? {
        header: t('asset:columns.device_status'),
        accessorKey: 'device_status',

        cell: ({
          row: {
            original: { status_device, battery, signal, power },
          },
        }) => (
          <AssetListDeviceStatusBox
            status_device={status_device}
            battery={battery}
            signal={signal}
            power={power}
          />
        ),
      }
    : {
        header: t('asset:columns.working_status'),
        accessorKey: 'working_status',

        cell: ({
          row: {
            original: { working_status },
          },
        }) => working_status ?? '',
      }

  const schema: Array<ColumnDef<TAssetData>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      cell: ({
        row: {
          original: { si_no },
        },
      }) => thousandFormatter({ value: Number(si_no), locale: language }),
    },
    {
      header: t('asset:columns.asset_name'),
      accessorKey: 'asset_name',
      cell: ({
        row: {
          original: { serial_number, asset_model, manufacture, entity },
        },
      }) => {
        const assetModelName = asset_model ? ` - ${asset_model?.name}` : ''
        const manufactureName = manufacture ? ` - (${manufacture?.name})` : ''
        const regencyName = entity?.regency ? `${entity?.regency?.name}, ` : ''
        return (
          <AssetTitleBlock
            arrText={[
              {
                label: `${serial_number}${assetModelName}${manufactureName}`,
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
              },
              {
                label: entity?.name,
                className: 'ui-text-sm ui-font-bold ui-text-sky-500 ui-my-1',
              },
              {
                label: `${regencyName}${entity?.province?.name}`,
                className: 'ui-text-xs ui-font-thin ui-text-gray-700',
              },
            ]}
          />
        )
      },
    },
    {
      header: t('asset:columns.asset_type'),
      accessorKey: 'asset_type',
      cell: ({ row }) => row?.original?.asset_type?.name ?? '',
    },
    {
      header: t('asset:columns.temperature'),
      accessorKey: 'temperature',
      cell: ({
        row: {
          original: { latest_log, status_device, parent, temp },
        },
      }) => (
        <AssetDegreeManagement
          latestLog={latest_log}
          parent={parent}
          temp={temp as number}
          assetType={status_device}
          statusDevice={status_device}
        />
      ),
    },
    deviceWorkingStatusColumn,
    {
      header: t('common:action'),
      accessorKey: 'device_type',

      cell: ({ row }) => <AssetDetailButton id={row.original?.id} />,
    },
  ]

  return schema
}

export default {}
