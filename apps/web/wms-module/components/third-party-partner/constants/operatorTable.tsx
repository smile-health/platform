import { TPartnershipOperator } from '@/types/partnership-operator';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

export const columnsOperatorTable = (
  t: TFunction<['common', 'thirdPartyPartner']>
): ColumnDef<TPartnershipOperator>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => index + 1,
  },
  {
    header: t('thirdPartyPartner:list.column_operator.username '),
    accessorKey: 'username',
    id: 'username',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.userName ?? '-',
  },
  {
    header: t('thirdPartyPartner:list.column_operator.name'),
    accessorKey: 'name',
    id: 'name',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      `${original.firstName ?? ''} ${original.lastName ?? ''}`.trim() || '-',
  },
  {
    header: t('thirdPartyPartner:list.column_operator.role'),
    accessorKey: 'role',
    id: 'role',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.userRole ?? '-',
  },
  {
    header: t('thirdPartyPartner:list.column_operator.company_name'),
    accessorKey: 'company_name',
    id: 'company_name',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.entityName ?? '-',
  },
  {
    header: t('thirdPartyPartner:list.column_operator.email'),
    accessorKey: 'email',
    id: 'email',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.email ?? '-',
  },
  {
    header: t('thirdPartyPartner:list.column_operator.phone'),
    accessorKey: 'phone',
    id: 'phone',
    size: 150,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      const phone = original.mobilePhone;
      return phone === null || phone === undefined || phone.trim() === ''
        ? '-'
        : phone;
    },
  },
];
