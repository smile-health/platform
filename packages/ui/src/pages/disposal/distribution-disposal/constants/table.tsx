import { useContext } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import MobileV2 from '#components/icons/MobileV2'
import WebV2 from '#components/icons/WebV2'
import { parseDateTime } from '#utils/date'
import { TFunction } from 'i18next'

import DistributionDisposalDetailMaterialReceiveButton from '../components/DistributionDisposalDetailMaterialReceiveButton'
import DistributionDisposalDetailTitleBlock from '../components/DistributionDisposalDetailTitleBlock'
import DistributionDisposalListButtonDetail from '../components/DistributionDisposalListButtonDetail'
import DistributionDisposalListStatusCapsule from '../components/DistributionDisposalListStatusCapsule'
import {
  DetailDistributionDisposalItem,
  TDistributionDisposal,
  TDistributionDisposalShipmentDetailStockReformed,
} from '../types/DistributionDisposal'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'
import { thousandFormatter } from '../utils/util'

type ColumnsProps = {
  t: TFunction<['common', 'distributionDisposal']>
  no: number
}

const DEVICE_TYPE = {
  WEB: 1,
}

export const columns = ({
  t,
  no,
}: ColumnsProps): ColumnDef<TDistributionDisposal>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    cell: ({ row: { index } }) => index + 1 + no,
    size: 50,
    meta: {
      cellClassName: 'ui-text-dark-blue ui-content-center',
    },
  },
  {
    header: t('distributionDisposal:table.column.no'),
    accessorKey: 'id',
    meta: {
      cellClassName: 'ui-text-dark-blue ui-content-center',
    },
    cell: ({
      row: {
        original: { id },
      },
    }) => `KPM-${id}`,
  },
  {
    header: t('distributionDisposal:table.column.total'),
    accessorKey: 'disposal_items',
    meta: {
      cellClassName: 'ui-text-dark-blue ui-content-center',
    },
    cell: ({
      row: {
        original: { disposal_items },
      },
    }) => disposal_items?.length,
  },
  {
    header: t('distributionDisposal:table.column.activity'),
    accessorKey: 'activity.name',
    meta: {
      cellClassName: 'ui-content-center',
    },
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({
      row: {
        original: { status },
      },
    }) => <DistributionDisposalListStatusCapsule status={status} capsuleOnly />,
    meta: {
      cellClassName: 'ui-text-dark-blue ui-content-center',
    },
  },
  {
    header: t('distributionDisposal:table.column.sender'),
    accessorKey: 'vendor.name',
    meta: {
      cellClassName: 'ui-text-dark-blue ui-content-center',
    },
  },
  {
    header: t('distributionDisposal:table.column.receiver'),
    accessorKey: 'customer.name',
    meta: {
      cellClassName: 'ui-text-dark-blue ui-content-center',
    },
  },
  {
    header: t('distributionDisposal:table.column.created_by'),
    accessorKey: 'created_by',
    meta: {
      cellClassName: 'ui-text-dark-blue ui-content-center',
    },
    size: 20,
    cell: ({
      row: {
        original: { user_created_by, created_at },
      },
    }) => (
      <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
          {user_created_by?.firstname} {user_created_by?.lastname ?? ''}
        </p>
        <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
          {parseDateTime(created_at, 'DD MMM YYYY HH:mm').toUpperCase()}
        </p>
      </div>
    ),
  },
  {
    header: t('distributionDisposal:table.column.device_type'),
    accessorKey: 'device_type',
    meta: {
      cellClassName: 'ui-content-center',
      headerClassName: 'ui-text-center',
    },
    cell: ({
      row: {
        original: { device_type },
      },
    }) => (
      <div className="ui-text-primary-500 ui-w-full ui-justify-center ui-flex">
        <div className="ui-w-fit">
          {device_type === DEVICE_TYPE.WEB ? <WebV2 /> : <MobileV2 />}
        </div>
      </div>
    ),
  },
  {
    header: t('common:action'),
    accessorKey: 'id_detail',
    meta: {
      cellClassName: 'ui-text-primary-500 ui-content-center',
    },
    cell: ({
      row: {
        original: { id },
      },
    }) => <DistributionDisposalListButtonDetail id={id} />,
  },
]

export const MaterialItemColumns = ({
  t,
  locale,
  setSelected,
}: {
  t: TFunction<['common', 'distributionDisposal']>
  locale: string
  setSelected: (value: {
    open: boolean
    data?: DetailDistributionDisposalItem
  }) => void
}): ColumnDef<DetailDistributionDisposalItem>[] => {
  const { inProcess } = useContext(DistributionDisposalDetailContext)

  const receivedColumns: ColumnDef<DetailDistributionDisposalItem> = {
    accessorKey: 'id',
    header: t('distributionDisposal:table.column.received'),
    cell: ({ row: { original } }) => (
      <DistributionDisposalDetailMaterialReceiveButton item={original} />
    ),
  }

  const previewColumns: ColumnDef<DetailDistributionDisposalItem>[] = [
    {
      accessorKey: 'master_material.name',
      header: 'Material',
    },
    {
      accessorKey: 'qty',
      header: t('distributionDisposal:filter.value.status', {
        returnObjects: true,
      })[0],
      cell: ({
        row: {
          original: { shipped_qty, ...rest },
        },
      }) => (
        <div className="ui-flex ui-flex-col">
          {thousandFormatter({
            value: Number(shipped_qty),
            locale,
          })}
          {shipped_qty ? (
            <Button
              variant="subtle"
              type="button"
              className="!ui-text-dark-teal !ui-p-0 !ui-w-fit"
              onClick={() =>
                setSelected({
                  open: true,
                  data: {
                    ...rest,
                    qty: Number(shipped_qty ?? 0),
                  },
                })
              }
            >
              {t('common:view_detail')}
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  if (inProcess) {
    previewColumns.push(receivedColumns)
  }

  return previewColumns
}

export const StockDetailColumns = ({
  t,
  language,
  nothingHasBatch,
}: {
  t: TFunction<['common', 'distributionDisposal']>
  language: string
  nothingHasBatch: boolean
}): ColumnDef<TDistributionDisposalShipmentDetailStockReformed>[] => {
  const batchColumn = {
    header: t('distributionDisposal:table.column.batch_info'),
    accessorKey: 'batch',
    cell: ({
      row: {
        original: { batch, accumulated_reasons },
      },
    }) => (
      <DistributionDisposalDetailTitleBlock
        arrText={[
          {
            label: batch?.code ?? '-',
            className: 'ui-text-dark-blue ui-font-bold ui-mb-1',
          },
          ...accumulated_reasons.map((itemReason) => ({
            label: `${itemReason.reason}: `,
            className: 'ui-text-dark-blue ui-font-normal ui-mb-1 last:ui-mb-0',
            label2: thousandFormatter({
              value: itemReason.qty ?? 0,
              locale: language,
            }),
          })),
        ]}
      />
    ),
  } as ColumnDef<TDistributionDisposalShipmentDetailStockReformed>
  const quantityColumn = [
    {
      header: t('distributionDisposal:table.column.quantity_from_discard'),
      accessorKey: 'batch',
      cell: ({
        row: {
          original: { disposal_discard_reasons },
        },
      }) => (
        <DistributionDisposalDetailTitleBlock
          arrText={disposal_discard_reasons.map((itemReason) => ({
            label: `${itemReason.reason}: `,
            className: 'ui-text-dark-blue ui-font-normal ui-mb-1 last:ui-mb-0',
            label2: thousandFormatter({
              value: itemReason.qty ?? 0,
              locale: language,
            }),
          }))}
        />
      ),
    },
    {
      header: t('distributionDisposal:table.column.quantity_from_received'),
      accessorKey: 'batch',
      cell: ({
        row: {
          original: { disposal_received_reasons },
        },
      }) => (
        <DistributionDisposalDetailTitleBlock
          arrText={disposal_received_reasons.map((itemReason) => ({
            label: `${itemReason.reason}: `,
            className: 'ui-text-dark-blue ui-font-normal ui-mb-1 last:ui-mb-0',
            label2: thousandFormatter({
              value: itemReason.qty ?? 0,
              locale: language,
            }),
          }))}
        />
      ),
    },
  ] as ColumnDef<TDistributionDisposalShipmentDetailStockReformed>[]

  if (!nothingHasBatch) {
    quantityColumn.unshift(batchColumn)
  }

  return quantityColumn
}
