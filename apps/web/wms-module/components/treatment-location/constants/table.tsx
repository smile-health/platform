import { ButtonActionTable } from '@/components/ButtonActionTable';
import { TEntityLocation } from '@/types/entity-location';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
  handleDeleteEntityLocation?: (id: number) => void;
};

export const columnsTreatmentLocation = (
  t: TFunction<['common', 'treatmentLocation']>,
  { page, size, handleDeleteEntityLocation }: DataProps
): ColumnDef<TEntityLocation>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('treatmentLocation:list.column.location_name'),
    accessorKey: 'location_name',
    id: 'location_name',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.locationName ?? '-',
  },
  {
    header: t('treatmentLocation:list.column.latitude'),
    accessorKey: 'latitude',
    id: 'latitude',
    size: 120,
    enableSorting: false,
    cell: ({ row: { original } }) => original.latitude ?? '-',
  },
  {
    header: t('treatmentLocation:list.column.longitude'),
    accessorKey: 'longitude',
    id: 'longitude',
    size: 120,
    enableSorting: false,
    cell: ({ row: { original } }) => original.longitude ?? '-',
  },
  {
    header: t('treatmentLocation:list.column.address'),
    accessorKey: 'address',
    id: 'address',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.address ?? '-',
  },
  {
    header: t('treatmentLocation:list.column.province'),
    accessorKey: 'province',
    id: 'province',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.provinceName ?? '-',
  },
  {
    header: t('treatmentLocation:list.column.city'),
    accessorKey: 'city',
    id: 'city',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.cityName ?? '-',
  },
  {
    header: t('treatmentLocation:list.column.action'),
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
            path={'/treatment-location'}
            hidden={['detail', 'activation']}
          />
          <Button
            onClick={() =>
              handleDeleteEntityLocation &&
              handleDeleteEntityLocation(original.id)
            }
            type="button"
            variant="subtle"
            className="!ui-px-1.5 ui-text-danger-500"
          >
            {t('common:remove')}
          </Button>
        </div>
      );
    },
  },
];
