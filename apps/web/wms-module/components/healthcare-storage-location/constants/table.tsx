import { ButtonActionTable } from '@/components/ButtonActionTable';
import { TEntityLocation } from '@/types/entity-location';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
};

export const columnsHealthcareStorageLocation = (
  t: TFunction<['common', 'healthcareStorageLocation']>,
  { page, size }: DataProps
): ColumnDef<TEntityLocation>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('healthcareStorageLocation:column.location_name'),
    accessorKey: 'location_name',
    id: 'location_name',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.locationName ?? '-',
  },
  {
    header: t('healthcareStorageLocation:column.latitude'),
    accessorKey: 'latitude',
    id: 'latitude',
    size: 150,
    enableSorting: false,
    cell: ({ row: { original } }) => original.latitude ?? '-',
  },
  {
    header: t('healthcareStorageLocation:column.longitude'),
    accessorKey: 'longitude',
    id: 'longitude',
    size: 150,
    enableSorting: false,
    cell: ({ row: { original } }) => original.longitude ?? '-',
  },
  {
    header: t('healthcareStorageLocation:column.address'),
    accessorKey: 'address',
    id: 'address',
    size: 250,
    enableSorting: false,
    cell: ({ row: { original } }) => original.address ?? '-',
  },
  {
    header: t('healthcareStorageLocation:column.province'),
    accessorKey: 'province',
    id: 'province',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.provinceName ?? '-',
  },
  {
    header: t('healthcareStorageLocation:column.city'),
    accessorKey: 'city',
    id: 'city',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.cityName ?? '-',
  },
  {
    header: t('healthcareStorageLocation:column.action'),
    accessorKey: 'action',
    id: 'action',
    meta: {
      hidden: loggedAsAdmin(),
    },
    size: 160,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-2">
          <ButtonActionTable
            id={original?.id}
            path={'/healthcare-storage-location'}
            hidden={['detail', 'activation']}
          />
        </div>
      );
    },
  },
];
