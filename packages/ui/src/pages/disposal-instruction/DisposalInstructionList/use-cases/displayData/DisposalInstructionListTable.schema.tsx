import { ColumnDef } from '@tanstack/react-table'
import MobileV2 from '#components/icons/MobileV2'
import WebV2 from '#components/icons/WebV2'
import { ButtonActionTable } from '#components/modules/ButtonActionTable'
import { Pagination } from '#types/common'
import { getFullName } from '#utils/strings'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { DEVICE_TYPE } from '../../../../transaction/TransactionList/helpers/transaction-list.constant'
import { DisposalInstructionListItem } from '../../disposal-instruction-list.type'

const disposalInstructionListTableSchema = (
  t: TFunction<['disposalInstruction', 'disposalInstructionList']>,
  pagination: Pagination
): Array<ColumnDef<DisposalInstructionListItem>> => {
  return [
    {
      header: t('disposalInstructionList:table.column.no'),
      accessorKey: 'number',
      size: 50,
      minSize: 50,
      cell: ({ row }) => {
        return (pagination.page - 1) * pagination.paginate + (row.index + 1)
      },
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('disposalInstruction:data.bast_no'),
      accessorKey: 'bast_no',
      size: 200,
      minSize: 200,
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('disposalInstruction:data.item'),
      accessorKey: 'disposal_items_count',
      size: 70,
      minSize: 70,
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('disposalInstruction:data.activity'),
      accessorKey: 'activity_label',
      size: 100,
      minSize: 100,
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('disposalInstruction:data.type'),
      accessorKey: 'instruction_type_label',
      size: 150,
      minSize: 150,
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('disposalInstruction:data.created_by'),
      accessorKey: 'updated_at',
      size: 200,
      minSize: 200,
      cell: ({ row }) => {
        return (
          <div className="ui-space-y-1.5">
            <div>
              {getFullName(
                row.original.user_created_by.firstname,
                row.original.user_created_by.lastname
              )}
            </div>
            <div className="ui-text-gray-500">
              {dayjs(row.original.created_at)
                .format('DD MMM YYYY HH:mm')
                .toUpperCase()}
            </div>
          </div>
        )
      },
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('disposalInstruction:data.device_type'),
      accessorKey: 'device_type',
      size: 100,
      minSize: 100,
      cell: ({
        row: {
          original: { device_type },
        },
      }) => (
        <div className="ui-text-primary-500">
          <div className="ui-w-fit">
            {device_type === DEVICE_TYPE.WEB ? <WebV2 /> : <MobileV2 />}
          </div>
        </div>
      ),
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
    {
      header: t('disposalInstructionList:table.column.action'),
      accessorKey: 'action',
      size: 30,
      minSize: 30,
      cell: ({ row }) => {
        const item = row?.original

        return (
          <ButtonActionTable
            id={item?.id}
            path="disposal-instruction"
            hidden={['edit', 'activation']}
          />
        )
      },
      meta: {
        cellClassName: 'ui-content-center',
      },
    },
  ]
}

export default disposalInstructionListTableSchema
