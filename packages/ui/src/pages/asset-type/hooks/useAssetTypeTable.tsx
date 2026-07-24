import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { parseDateTime } from '#utils/date'
import { getFullName } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import {
  AssetTypeTableProps,
  DetailAssetTypeResponse,
} from '../asset-type.type'

const useAssetTypeTable = ({
  isGlobal = false,
  size,
  page,
}: AssetTypeTableProps) => {
  const { t } = useTranslation(['assetType', 'common'])
  const { getAsLinkGlobal } = useSmileRouter()

  const handleAction = (type: 'edit' | 'detail', id: string | number) => {
    const isEdit = type === 'edit'

    return getAsLinkGlobal(
      `/v5/global-settings/asset/type/${id}${isEdit ? '/edit' : ''}`,
      null,
      isEdit
        ? {
            fromPage: 'list',
          }
        : undefined
    )
  }

  const schema: Array<ColumnDef<DetailAssetTypeResponse>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 40,
      minSize: 40,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: t('list.column.name'),
      accessorKey: 'name',
      minSize: 300,
      size: 300,
      enableSorting: true,
    },
    {
      header: t('list.column.update_by'),
      accessorKey: 'updated_at',
      size: 300,
      minSize: 300,
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div className="ui-flex ui-flex-col">
            <p className="ui-font-semibold ui-uppercase">
              {parseDateTime(
                row.original.updated_at || '',
                'DD MMM YYYY HH:mm'
              )}
            </p>
            <p>
              {getFullName(
                row?.original?.user_updated_by?.firstname,
                row?.original?.user_updated_by?.lastname
              )}
            </p>
          </div>
        )
      },
    },
    {
      header: t('list.column.action'),
      accessorKey: 'action',
      size: 200,
      minSize: 200,
      cell: ({ row }) => {
        return (
          <div className="ui-flex ui-gap-2 -ml-3">
            <Button
              asChild
              id="btn-link-asset-type-detail"
              size="sm"
              variant="subtle"
            >
              <Link href={handleAction('detail', row.original.id)}>Detail</Link>
            </Button>
            <Button
              asChild
              id="btn-link-asset-type-edit"
              size="sm"
              variant="subtle"
            >
              <Link href={handleAction('edit', row.original.id)}>
                {t('common:edit')}
              </Link>
            </Button>
          </div>
        )
      },
    },
  ]

  return {
    schema,
  }
}

export default useAssetTypeTable
