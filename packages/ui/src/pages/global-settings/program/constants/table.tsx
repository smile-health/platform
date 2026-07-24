import { Button } from "#components/button"
import ActiveLabel from "#components/modules/ActiveLabel"
import { ActivityData } from "#types/activity"
import { TProgram } from "#types/program"
import { parseDateTime } from "#utils/date"
import { ColumnDef } from "@tanstack/react-table"
import { TFunction } from "i18next"
import { PROTOCOL_NAME } from "./options"

type ColumnProps = {
  t: TFunction<['common', 'programGlobalSettings']>
  handleAction: (type: 'edit' | 'detail', id: number) => void
  page?: number
  size?: number
}

export const columns = ({ t, handleAction, page = 1, size = 10 }: ColumnProps): ColumnDef<TProgram>[] => [
  {
    header: 'No',
    accessorKey: 'no',
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    size: 10
  },
  {
    header: t('programGlobalSettings:column.name'),
    accessorKey: 'name',
    enableSorting: true,
    minSize: 200,
  },
  {
    header: t('programGlobalSettings:column.classification_material'),
    accessorKey: 'is_hierarchy_enabled',
    enableSorting: true,
    cell: ({ row: { original } }) => original.config.material.is_hierarchy_enabled ?
      t('programGlobalSettings:form.options.classification_material.hierarchy') : t('programGlobalSettings:form.options.classification_material.non_hierarchy')
  },
  {
    header: t('programGlobalSettings:column.updated_at'),
    accessorKey: 'updated_at',
    enableSorting: true,
    cell: ({ row: { original } }) => parseDateTime(original.updated_at),
  },
  {
    header: t('programGlobalSettings:column.updated_by'),
    accessorKey: 'user_updated_by',
    cell: ({ row: { original } }) => {
      const { user_updated_by } = original

      if (!user_updated_by?.firstname && !user_updated_by?.lastname) return '-'

      return `${user_updated_by?.firstname ?? ''} ${user_updated_by?.lastname ?? ''}`
    },
  },
  {
    header: t('common:action'),
    accessorKey: 'action',
    size: 160,
    cell: ({ row: { original } }) => (
      <div className="ui-flex ui-gap-2">
        <Button
          id="btn-detail-program"
          size="sm"
          variant="subtle"
          className="ui-text-polynesianblue-600 ui-px-1.5"
          onClick={() => handleAction('detail', original.id)}
        >
          {t('common:detail')}
        </Button>
        <Button
          id="btn-edit-program"
          size="sm"
          variant="subtle"
          className="ui-text-polynesianblue-600 ui-px-1.5"
          onClick={() => handleAction('edit', original.id)}
        >
          {t('common:edit')}
        </Button>
      </div>
    )
  },
]

export const columnsActivity = ({ t, handleAction, page, size }: ColumnProps & { page: number, size: number }): ColumnDef<ActivityData>[] => [
  {
    header: 'No',
    accessorKey: 'no',
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    size: 10
  },
  {
    header: t('programGlobalSettings:column.activity_name'),
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    header: t('programGlobalSettings:column.activity_process'),
    accessorKey: 'activity_process',
    cell: ({ row: { original: { is_ordered_sales, is_ordered_purchase } } }) => {
      const result = [
        is_ordered_sales && 'Top Down',
        is_ordered_purchase && 'Bottom Up'
      ].filter(Boolean).join(', ') || '-';

      return result
    }
  },
  {
    header: t('programGlobalSettings:column.protocol'),
    accessorKey: 'protocol',
    cell: ({ row: { original: { protocol } } }) => PROTOCOL_NAME[protocol as keyof typeof PROTOCOL_NAME] ?? '-',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row: { original: { status } } }) => <ActiveLabel isActive={!!status} />,
    size: 160,
  },
  {
    header: t('common:action'),
    accessorKey: 'action',
    size: 123,
    minSize: 123,
    cell: ({ row: { original } }) => (
      <div className="ui-flex ui-gap-2">
        <Button
          id="btn-detail-activity-programdetail"
          size="sm"
          variant="subtle"
          className="ui-text-polynesianblue-600"
          onClick={() => handleAction('detail', original.id)}
        >
          {t('common:detail')}
        </Button>
        <Button
          id="btn-edit-activity-program"
          size="sm"
          variant="subtle"
          className="ui-text-polynesianblue-600"
          onClick={() => handleAction('edit', original.id)}
        >
          {t('common:edit')}
        </Button>
      </div>
    )
  },
]