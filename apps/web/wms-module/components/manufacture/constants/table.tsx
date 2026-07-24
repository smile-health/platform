import { ButtonActionTable } from '@/components/ButtonActionTable';
import { getAssetTypeOptions } from '@/components/healthcare/utils/helper';
import { TManufacture } from '@/types/manufacture';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
  handleDeleteManufacture?: (id: number) => void;
};

export const columnsManufacture = (
  t: TFunction<['common', 'manufacture']>,
  { page, size, handleDeleteManufacture }: DataProps
): ColumnDef<TManufacture>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('manufacture:list.column.asset_type'),
    accessorKey: 'asset_type',
    id: 'asset_type',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      const assetType = original.assetType;
      if (!assetType) return '-';
      const typeOption = getAssetTypeOptions(t).find(
        (opt) => opt.value === assetType
      );
      return typeOption?.label ?? assetType;
    },
  },
  {
    header: t('manufacture:list.column.manufacture'),
    accessorKey: 'manufacture',
    id: 'manufacture',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.manufacturer?.name ?? '-',
  },
  {
    header: t('manufacture:list.column.asset_model'),
    accessorKey: 'asset_model',
    id: 'asset_model',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.name ?? '-',
  },
  {
    header: t('manufacture:list.column.description'),
    accessorKey: 'description',
    id: 'description',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.description ?? '-',
  },
  {
    header: t('manufacture:list.column.updated_by'),
    accessorKey: 'updated_by',
    id: 'updated_by',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-flex-col ui-gap-0.5">
          <p>{original.userName}</p>
          <p>
            {original.updatedAt
              ? dayjs(original.updatedAt).format('DD/MM/YYYY')
              : '-'}
          </p>
        </div>
      );
    },
  },
  {
    header: t('manufacture:list.column.action'),
    accessorKey: 'action',
    id: 'action',
    meta: {
      hidden: loggedAsAdmin(),
    },
    size: 160,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex">
          <ButtonActionTable
            id={original?.id}
            path={'/manufacture'}
            hidden={['detail', 'activation']}
          />
          <Button
            onClick={() =>
              handleDeleteManufacture && handleDeleteManufacture(original.id)
            }
            type="button"
            variant="subtle"
            className="!ui-px-1.5 ui-text-danger-200"
          >
            {t('common:remove')}
          </Button>
        </div>
      );
    },
  },
];
