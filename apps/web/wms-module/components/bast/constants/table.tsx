import { TBast } from '@/types/bast';
import { isFacilityAdmin } from '@/utils/getUserRole';
import { Badge, BadgeColor } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import { mapBastStatus } from '../utils/helper';

type DataProps = {
  page: number;
  size: number;
  handleOpenDetail: (data: TBast) => void;
  handleApproval: (data: TBast) => void;
};

export const columnsBast = (
  t: TFunction<['common', 'bast']>,
  { page, size, handleOpenDetail, handleApproval }: DataProps
): ColumnDef<TBast>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('bast:list.column.entity_name'),
    accessorKey: 'entity_name',
    id: 'entity_name',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.entityName ?? '-',
  },
  {
    header: t('bast:list.column.created_at'),
    accessorKey: 'created_at',
    id: 'created_at',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      original.createdAt
        ? dayjs(original.createdAt).format('DD/MM/YYYY HH:mm')
        : '-',
  },
  {
    header: t('bast:list.column.created_by'),
    accessorKey: 'created_by',
    id: 'created_by',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.createdName ?? '-',
  },
  {
    header: t('bast:list.column.no_handover_document'),
    accessorKey: 'no_handover_document',
    id: 'no_handover_document',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.bastNo ?? '-',
  },
  {
    header: t('bast:list.column.description'),
    accessorKey: 'description',
    id: 'description',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.description ?? '-',
  },
  {
    header: t('bast:list.column.status'),
    accessorKey: 'status',
    id: 'status',
    size: 150,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      const statusMap: Record<string, BadgeColor> = {
        PENDING: 'info',
        APPROVED: 'success',
        REJECTED: 'danger',
      };

      const statusColor = statusMap[original.status] || 'info';

      return (
        <Badge rounded="full" color={statusColor} variant="light">
          {mapBastStatus(original.status)}
        </Badge>
      );
    },
  },
  {
    header: t('bast:list.column.action'),
    accessorKey: 'action',
    id: 'action',
    size: 160,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-0.5">
          <Button
            type="button"
            variant="subtle"
            className="!ui-px-1.5 ui-text-blue-500"
            onClick={() => handleOpenDetail(original)}
          >
            {t('common:detail')}
          </Button>
          {isFacilityAdmin() && (
            <Button
              type="button"
              variant="subtle"
              className="!ui-px-1.5 ui-text-blue-500"
              onClick={() => handleApproval(original)}
            >
              {t('common:approval')}
            </Button>
          )}
        </div>
      );
    },
  },
];
