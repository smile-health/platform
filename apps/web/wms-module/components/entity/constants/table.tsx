import { ButtonActionTable } from '@/components/ButtonActionTable';
import { TEntitiesWms, TEntityDetailUser } from '@/types/entity';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
  handleUpdateEntityStatus?: (data: TEntitiesWms) => void;
};

export const columnsEntity = (
  t: TFunction<['common', 'entityWMS']>,
  { page, size, handleUpdateEntityStatus }: DataProps
): ColumnDef<TEntitiesWms>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    size: 50,
  },
  {
    header: t('entityWMS:list.column.name'),
    id: 'entity_name',
    accessorKey: 'name',
    enableSorting: false,
    size: 200,
    cell: ({ row: { original } }) => original.name ?? '-',
  },
  {
    header: t('entityWMS:list.column.location'),
    id: 'location',
    accessorKey: 'tag',
    enableSorting: false,
    size: 200,
    cell: ({ row: { original } }) => original.location ?? '-',
  },
  {
    header: t('entityWMS:list.column.province'),
    id: 'province',
    accessorKey: 'province',
    enableSorting: false,
    size: 200,
    cell: ({ row: { original } }) => original.province_name ?? '-',
  },

  {
    header: t('entityWMS:list.column.city'),
    id: 'city',
    accessorKey: 'city',
    enableSorting: false,
    size: 200,
    cell: ({ row: { original } }) => original.regency_name ?? '-',
  },
  {
    header: t('entityWMS:list.column.status'),
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    size: 150,
    cell: ({ row: { original } }) => {
      return (
        <Badge
          rounded="full"
          color={original.is_active ? 'success' : 'danger'}
          variant="light"
        >
          {original.is_active
            ? t('entityWMS:list.filter.status.active')
            : t('entityWMS:list.filter.status.inactive')}
        </Badge>
      );
    },
  },
  {
    header: t('entityWMS:list.column.satu_sehat_code'),
    id: 'satu_sehat_code',
    accessorKey: 'satu_sehat_code',
    enableSorting: false,
    size: 150,
    cell: ({ row: { original } }) => original.id_satu_sehat ?? '-',
  },
  {
    header: t('entityWMS:list.column.action'),
    accessorKey: 'action',
    size: 200,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-0.5">
          <ButtonActionTable
            id={original?.id}
            path={'entity'}
            hidden={['activation', 'edit']}
          />
          <Button
            onClick={() =>
              handleUpdateEntityStatus && handleUpdateEntityStatus(original)
            }
            type="button"
            variant="subtle"
            color={original.is_active ? 'danger' : 'info'}
            className="!ui-px-1.5"
          >
            {original.is_active
              ? t('entityWMS:action.deactivate.button')
              : t('entityWMS:action.activate.button')}
          </Button>
        </div>
      );
    },
  },
];

export type ColumnsEntityUser = {
  username: string;
  full_name: string;
  role: string;
  phone_number: string;
};
export const columnsEntityDetailsUsers = (
  t: TFunction<['common', 'entityWMS', 'user']>,
  { page, paginate }: { page: number; paginate: number }
): ColumnDef<TEntityDetailUser>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    cell: ({ row: { index } }) => (page - 1) * paginate + (index + 1),
    size: 50,
  },
  {
    header: t('user:column.username'),
    accessorKey: 'username',
    cell: ({
      row: {
        original: { username },
      },
    }) => username || '-',
    size: 200,
  },
  {
    header: t('user:column.fullname'),
    accessorKey: 'fullname',
    cell: ({
      row: {
        original: { firstname, lastname },
      },
    }) => `${firstname} ${lastname ?? ''}`.trim(),
    size: 200,
  },
  {
    header: t('user:column.role'),
    accessorKey: 'role',
    cell: ({
      row: {
        original: { external_properties },
      },
    }) => external_properties?.role?.name ?? '-',
    size: 200,
  },
  {
    header: t('user:column.mobile_phone'),
    accessorKey: 'mobile_phone',
    cell: ({
      row: {
        original: { mobile_phone },
      },
    }) => mobile_phone || '-',
    size: 200,
  },
];
