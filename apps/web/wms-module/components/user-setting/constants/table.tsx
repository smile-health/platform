import { ButtonActionTable } from '@/components/ButtonActionTable';
import { TUser } from '@/types/user';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import i18n from '@/locales/i18n';

type DataProps = {
  page: number;
  size: number;
  handleUpdateUserStatus?: (data: TUser) => void;
};

export const columnsUser = (
  t: TFunction<['common', 'userSetting']>,
  { page, size, handleUpdateUserStatus }: DataProps
): ColumnDef<TUser>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    size: 50,
  },
  {
    header: t('userSetting:column.username'),
    id: 'username',
    accessorKey: 'username',
    enableSorting: false,
    size: 200,
    cell: ({ row: { original } }) => original.username ?? '-',
  },
  {
    header: t('userSetting:column.fullname'),
    id: 'fullname',
    accessorKey: 'fullname',
    enableSorting: false,
    size: 200,
    cell: ({ row: { original } }) =>
      `${original.firstname ?? ''} ${original.lastname ?? ''}`.trim() || '-',
  },
  {
    header: t('userSetting:column.role'),
    id: 'role',
    accessorKey: 'role',
    enableSorting: false,
    size: 200,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original.userRole?.name
        : original.userRole?.name_en) ?? '-',
  },
  {
    header: t('userSetting:column.entity.index'),
    id: 'entity',
    accessorKey: 'entity',
    enableSorting: false,
    size: 200,
    cell: ({ row: { original } }) => original.entity?.name ?? '-',
  },
  {
    header: t('userSetting:column.status'),
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    size: 100,
    cell: ({ row: { original } }) => {
      return (
        <Badge
          rounded="full"
          color={original.is_active ? 'success' : 'danger'}
          variant="light"
        >
          {original.is_active
            ? t('userSetting:filter.status.active')
            : t('userSetting:filter.status.inactive')}
        </Badge>
      );
    },
  },
  {
    header: t('userSetting:column.action'),
    accessorKey: 'action',
    size: 200,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-0.5">
          <ButtonActionTable
            id={original?.id}
            path={'user-setting'}
            hidden={['activation', 'edit']}
          />
          <Button
            onClick={() =>
              handleUpdateUserStatus && handleUpdateUserStatus(original)
            }
            type="button"
            variant="subtle"
            color={original.is_active ? 'danger' : 'info'}
            className="!ui-px-1.5"
          >
            {original.is_active
              ? t('userSetting:confirmation.deactivate.button')
              : t('userSetting:confirmation.activate.button')}
          </Button>
        </div>
      );
    },
  },
];
