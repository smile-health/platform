import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import {
  ActivityMaterial,
  DetailProtocolResponse,
  MaterialActivityTableProps,
  ProtocolTableProps,
} from './protocol.type'

export const columnsListProtocol = (
  t: TFunction<['common', 'protocol']>,
  { page, size, setLink, onChangeStatus }: ProtocolTableProps
): ColumnDef<DetailProtocolResponse>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    size: 40,
    minSize: 40,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('protocol:column.name'),
    size: 400,
    accessorKey: 'name',
  },
  {
    header: () => (
      <div className="ui-font-semibold ui-pl-3">{t('common:action')}</div>
    ),
    size: 130,
    maxSize: 200,
    accessorKey: 'action',
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-2">
          <Button
            asChild
            id="btn-configure-protocol"
            size="sm"
            variant="subtle"
          >
            <Link href={setLink(`/v5/protocol/${original?.id}`)}>
              {t('protocol:action.configure.button')}
            </Link>
          </Button>

          <Button
            id="btn-change-status"
            size="sm"
            variant="subtle"
            color="danger"
            onClick={() => onChangeStatus(original)}
          >
            {original.status === 0
              ? t('protocol:action.activate.button')
              : t('protocol:action.deactivate.button')}
          </Button>
        </div>
      )
    },
  },
]

export const columnsListActivityMaterial = (
  t: TFunction<['common', 'protocol']>,
  locale: string,
  { page, size, onDelete }: MaterialActivityTableProps
): ColumnDef<ActivityMaterial>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    size: 40,
    minSize: 40,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('common:name'),
    size: 400,
    accessorKey: 'material_name',
  },
  {
    header: t('protocol:detail.material_activity.relation.activity.label'),
    size: 400,
    accessorKey: 'activity_name',
  },
  {
    header: t('common:updated_by'),
    size: 400,
    accessorKey: 'updated_by',
    cell: ({ row: { original } }) => (
      <div>
        <p>
          {original.updated_by_firstname || '-'} {original.updated_by_lastname}
        </p>
        <p>
          {dayjs(original.updated_at)
            .locale(locale)
            .format('DD MMM YYYY HH:mm')}
        </p>
      </div>
    ),
  },
  {
    header: () => (
      <div className="ui-font-semibold ui-pl-3">{t('common:action')}</div>
    ),
    size: 130,
    maxSize: 200,
    accessorKey: 'action',
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-2">
          <Button
            id="btn-delete"
            size="sm"
            variant="subtle"
            color="danger"
            onClick={() => onDelete(original)}
          >
            {t('common:delete')}
          </Button>
        </div>
      )
    },
  },
]
