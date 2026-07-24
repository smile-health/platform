import { loggedAsAdmin } from '@/utils/getUserRole';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { TDetailEntity } from '@/types/entity';
import { ButtonActionTable } from '@/components/ButtonActionTable';
import { numberFormatter } from '@/utils/formatter';

type DataProps = {
  page: number;
  size: number;
  handleDeleteAssetDongle: (id: string) => void;
};

export const columnsAssetDongle = (
  t: TFunction<['common', 'assetDongle']>,
  { page, size }: DataProps
): ColumnDef<TDetailEntity>[] => {
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: t('assetDongle:list.column.entity_name'),
      accessorKey: 'name',
      id: 'name',
      enableSorting: false,
      cell: ({ row: { original } }) => original.name,
    },
    {
      header: t('assetDongle:list.column.location'),
      accessorKey: 'location',
      id: 'location',
      enableSorting: false,
      cell: ({ row: { original } }) => original.location,
    },
    {
      header: t('assetDongle:list.column.province'),
      accessorKey: 'province',
      id: 'province',
      enableSorting: false,
      cell: ({ row: { original } }) => original.province_name,
    },
    {
      header: t('assetDongle:list.column.regency'),
      accessorKey: 'regency',
      id: 'regency',
      enableSorting: false,
      cell: ({ row: { original } }) => original.regency_name,
    },
    {
      header: t('assetDongle:list.column.amount_of_dongle'),
      accessorKey: 'count_dongle',
      id: 'count_dongle',
      enableSorting: false,
      cell: ({ row: { original } }) => numberFormatter(original.count_dongle ?? 0),
    },
    {
      header: t('assetDongle:list.column.action'),
      accessorKey: 'action',
      id: 'action',
      meta: {
        hidden: loggedAsAdmin(),
      },

      // eslint-disable-next-line react/display-name
      cell: ({ row: { original } }) => {
        return (
          <ButtonActionTable
            id={original?.id}
            path={'asset-dongle'}
            hidden={['activation', 'edit']}
          />
        );
      },
    },
  ];
};
