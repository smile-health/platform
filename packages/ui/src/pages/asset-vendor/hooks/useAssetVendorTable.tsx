import { useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { parseDateTime } from '#utils/date'
import { getFullName } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import {
  AssetVendorTableProps,
  DetailAssetVendorResponse,
} from '../asset-vendor.type'

const useAssetVendorTable = ({
  isGlobal = false,
  page,
  size,
}: AssetVendorTableProps) => {
  const { t } = useTranslation(['assetVendor', 'common'])
  const { getAsLink, getAsLinkGlobal } = useSmileRouter()

  const [showConfirmation, setShowConfirmation] = useState<number | undefined>(
    undefined
  )

  const handleAction = (type: 'edit' | 'detail', id: string | number) => {
    const isEdit = type === 'edit'

    if (isGlobal) {
      return getAsLinkGlobal(
        `/v5/global-settings/asset/vendor/${id}${isEdit ? '/edit' : ''}`,
        null,
        isEdit
          ? {
              fromPage: 'list',
            }
          : undefined
      )
    }

    return getAsLink(
      `/v5/asset/vendor/${id}${isEdit ? '/edit' : ''}`,
      null,
      isEdit
        ? {
            fromPage: 'list',
          }
        : undefined
    )
  }

  const schema: Array<ColumnDef<DetailAssetVendorResponse>> = [
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
      minSize: 250,
      size: 250,
      enableSorting: true,
    },
    {
      header: t('list.column.type'),
      accessorKey: 'type',
      minSize: 250,
      size: 250,
      cell: ({ row }) => row?.original?.asset_vendor_type?.name ?? '-',
    },
    {
      header: t('list.column.last_updated_at'),
      accessorKey: 'updated_at',
      minSize: 250,
      size: 250,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="ui-flex ui-flex-col">
          <div className="ui-font-bold ui-mb-1">
            {parseDateTime(
              row.original.updated_at ?? '',
              'DD MMM YYYY HH:mm'
            ).toUpperCase()}
          </div>
          <div>
            {getFullName(
              row?.original?.user_updated_by?.firstname ?? '',
              row?.original?.user_updated_by?.lastname ?? ''
            )}
          </div>
        </div>
      ),
    },
    {
      header: t('list.column.action'),
      accessorKey: 'action',
      size: 100,
      minSize: 100,
      cell: ({ row }) => {
        return (
          <div className="ui-flex ui-gap-2 -ml-3">
            <Button
              asChild
              id="btn-link-asset-vendor-detail"
              size="sm"
              variant="subtle"
            >
              <Link href={handleAction('detail', row.original.id)}>Detail</Link>
            </Button>
            <Button
              asChild
              id="btn-link-asset-vendor-edit"
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
    showConfirmation,
    setShowConfirmation,
  }
}

export default useAssetVendorTable
