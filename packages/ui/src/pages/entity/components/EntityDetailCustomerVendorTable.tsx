import { Checkbox } from '@repo/ui/components/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { BOOLEAN } from '#constants/common'
import { TDetailEntity, TEntityCustomer } from '#types/entity'
import { TFunction } from 'i18next'

import { IS_CONSUMPTION } from '../utils/constants'
import type { THandleOpenModal } from './EntityDetailTabContents/EntityDetailCustomerVendorContent'

export type TColumn = {
  t: TFunction<['entity', 'common']>
  selectedRows?: string[]
  setSelectedRows?: (rows: string[]) => void
  deletingCustomer?: boolean
  handleOpenModal?: (data: THandleOpenModal) => void
  handleOpenDeleteModal?: (id: string) => void
  isConsumption?: IS_CONSUMPTION
  isViewOnly?: boolean
  entity?: TDetailEntity | null
}

export const columnVendor = ({ t }: TColumn) => {
  const schema: Array<ColumnDef<any>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      cell: ({ row }) => row.index + 1,
    },
    {
      header: t('entity:detail.customer_vendor.vendor_name'),
      accessorKey: 'name',
      minSize: 100,
      size: 100,
      maxSize: 100,
      cell: ({ row }) => row.original.name,
    },
    {
      header: t('entity:detail.customer_vendor.activity'),
      accessorKey: 'activity',
      minSize: 100,
      size: 100,
      maxSize: 100,
      cell: ({ row }) =>
        Array.isArray(row.original.activity)
          ? row.original?.activity
              ?.map((item: { name: string }) => item.name)
              .join(', ') || '-'
          : row.original.activity,
    },
    {
      header: t('entity:form.location.label.address'),
      accessorKey: 'address',
      minSize: 100,
      size: 100,
      maxSize: 100,
      cell: ({ row }) => row.original.address,
    },
    {
      header: t('entity:list.column.location'),
      accessorKey: 'location',
      minSize: 100,
      size: 100,
      maxSize: 100,
      cell: ({ row }) => row.original.location,
    },
  ]

  return schema
}

export const columnCustomer = ({
  t,
  selectedRows = [],
  setSelectedRows = () => {},
  deletingCustomer,
  handleOpenDeleteModal = () => {},
  isConsumption = IS_CONSUMPTION.FALSE,
  handleOpenModal,
  isViewOnly,
  entity,
}: TColumn) => {
  const schema: Array<ColumnDef<TEntityCustomer>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 20,
      cell: ({ row }) =>
        !isViewOnly ? (
          <Checkbox
            label={(row.index + 1)?.toString()}
            name="checkedOnes"
            checked={selectedRows.includes(row.original?.id?.toString())}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows([...selectedRows, row.original?.id?.toString()])
              } else {
                setSelectedRows(
                  selectedRows.filter(
                    (x: any) => x !== row.original?.id?.toString()
                  )
                )
              }
            }}
            disabled={deletingCustomer}
            value={row.original?.id?.toString()}
          />
        ) : (
          row.index + 1
        ),
    },
    {
      header: t('entity:detail.customer_vendor.customer_name'),
      accessorKey: 'name',
      minSize: 100,
      size: 100,
      maxSize: 100,
      cell: ({ row }) => row.original.name,
    },
    {
      header: t('entity:detail.customer_vendor.activity'),
      accessorKey: 'activity',
      minSize: 100,
      size: 100,
      maxSize: 100,
      cell: ({ row }) =>
        Array.isArray(row.original.activity)
          ? row.original?.activity
              ?.map((item: { name: string }) => item.name)
              .join(', ') || '-'
          : row.original.activity,
    },
    {
      header: t('entity:form.location.label.address'),
      accessorKey: 'address',
      minSize: 100,
      size: 100,
      maxSize: 100,
      cell: ({ row }) => row.original.address,
    },
    {
      header: t('entity:list.column.location'),
      accessorKey: 'location',
      minSize: 100,
      size: 100,
      maxSize: 100,
      cell: ({ row }) => row.original.location,
    },
  ]

  if (!isViewOnly)
    schema.push({
      header: t('common:action'),
      accessorKey: 'action',
      size: 50,
      cell: ({ row }) => (
        <div className="ui-flex ui-justify-start ui-items-center">
          <Button
            variant="light"
            className="ui-bg-transparent ui-p-0 ui-h-auto ui-mr-[18px] ui-text-[#0069D2] hover:!ui-bg-transparent"
            type="button"
            disabled={deletingCustomer || entity?.status === BOOLEAN.FALSE}
            onClick={() =>
              handleOpenModal?.({
                data: row.original,
                isConsumptionArg: isConsumption,
              })
            }
          >
            {t('entity:detail.customer_vendor.edit_activity')}
          </Button>
          <Button
            variant="light"
            color="danger"
            className="ui-bg-transparent ui-p-0 ui-h-auto hover:!ui-bg-transparent"
            type="button"
            onClick={() => handleOpenDeleteModal(row.original?.id?.toString())}
            disabled={deletingCustomer || entity?.status === BOOLEAN.FALSE}
          >
            {t('common:delete')}
          </Button>
        </div>
      ),
    })

  return schema
}

export default {}
