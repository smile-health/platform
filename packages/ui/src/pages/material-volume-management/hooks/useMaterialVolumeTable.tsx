import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { SingleValue } from '#components/modules/RenderDetailValue'
import useSmileRouter from '#hooks/useSmileRouter'
import {
  MaterialVolumeData,
  MaterialVolumeTableProps,
} from '#types/material-volume'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { getFullName } from '#utils/strings'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

const useMaterialVolumeTable = ({
  isGlobal = false,
  page,
  size,
}: MaterialVolumeTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['materialVolume', 'common'])
  const { getAsLinkGlobal } = useSmileRouter()

  const handleAction = (type: 'edit' | 'detail', id: string | number) => {
    const isEdit = type === 'edit'

    return getAsLinkGlobal(
      `/v5/global-settings/material/volume/${id}${isEdit ? '/edit' : ''}`,
      null,
      isEdit
        ? {
            fromPage: 'list',
          }
        : undefined
    )
  }

  const schema: Array<ColumnDef<MaterialVolumeData>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 40,
      minSize: 40,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: t('materialVolume:list.column.material_name'),
      accessorKey: 'material_name',
      minSize: 200,
      enableSorting: true,
      cell: ({ row }) => row.original?.material_name ?? '-',
    },
    {
      header: t('materialVolume:list.column.manufacturer_name'),
      accessorKey: 'manufacture_name',
      minSize: 200,
      enableSorting: true,
      cell: ({ row }) => row.original?.manufacture_name ?? '-',
    },
    {
      header: t('materialVolume:list.column.material_type'),
      accessorKey: 'type_material_name',
      minSize: 200,
      enableSorting: true,
      cell: ({ row }) => row.original?.material_type_name ?? '-',
    },
    {
      header: t('materialVolume:list.column.box_dimension.label'),
      accessorKey: 'dimension',
      minSize: 200,
      cell: ({ row }) => {
        const dimensions = [
          {
            label: t('materialVolume:list.column.box_dimension.length'),
            value: row.original?.box_length
              ? numberFormatter(row.original?.box_length, language)
              : '-',
          },
          {
            label: t('materialVolume:list.column.box_dimension.width'),
            value: row.original?.box_width
              ? numberFormatter(row.original?.box_width, language)
              : '-',
          },
          {
            label: t('materialVolume:list.column.box_dimension.height'),
            value: row.original?.box_height
              ? numberFormatter(row.original?.box_height, language)
              : '-',
          },
        ]
        return dimensions.map((v) => (
          <div className="ui-flex">
            <SingleValue
              key={v.label as string}
              label={v.label as string}
              value={t('materialVolume:list.column.box_dimension.cm', {
                value: v.value,
              })}
              labelClassName="ui-text-[#OC3045]"
              valueClassName="ui-ml-1"
            />
          </div>
        ))
      },
    },
    {
      header: t('materialVolume:list.column.last_updated_at'),
      accessorKey: 'updated_at',
      size: 220,
      minSize: 220,
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
      enableSorting: true,
    },
    {
      header: t('materialVolume:list.column.action'),
      accessorKey: 'action',
      size: 123,
      minSize: 123,
      cell: ({ row }) => (
        <div className="ui-flex ui-gap-2 -ml-3">
          <Button
            asChild
            id={`btn-link-material-volume-detail-${row.original.id}`}
            size="sm"
            variant="subtle"
          >
            <Link href={handleAction('detail', row.original.id)}>Detail</Link>
          </Button>
          {!isViewOnly() && isGlobal && (
            <Button
              asChild
              id={`btn-link-material-volume-edit-${row.original.id}`}
              size="sm"
              variant="subtle"
            >
              <Link href={handleAction('edit', row.original.id)}>
                {t('common:edit')}
              </Link>
            </Button>
          )}
        </div>
      ),
    },
  ]

  return {
    schema,
  }
}

export default useMaterialVolumeTable
