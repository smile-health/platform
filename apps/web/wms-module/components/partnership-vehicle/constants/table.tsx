import { ButtonActionTable } from '@/components/ButtonActionTable';
import { formatAllowedVehicleTypes } from '@/components/waste-specification/utils/helper';
import { TPartnershipVehicle } from '@/types/partnership-vehicle';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
  handleDeletePartnershipVehicle?: (id: number) => void;
};

export const columnsPartnershipVehicle = (
  t: TFunction<['common', 'partnershipVehicle']>,
  { page, size, handleDeletePartnershipVehicle }: DataProps
): ColumnDef<TPartnershipVehicle>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('partnershipVehicle:list.column.vehicle_type '),
    accessorKey: 'vehicle_type',
    id: 'vehicle_type',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      formatAllowedVehicleTypes(original.vehicleType),
  },
  {
    header: t('partnershipVehicle:list.column.vehicle_number'),
    accessorKey: 'vehicle_number',
    id: 'vehicle_number',
    size: 160,
    enableSorting: false,
    cell: ({ row: { original } }) => original.vehicleNumber ?? '-',
  },
  {
    header: t('partnershipVehicle:list.column.capacity'),
    accessorKey: 'capacity',
    id: 'capacity',
    size: 160,
    enableSorting: false,
    cell: ({ row: { original } }) => original.capacityInKgs ?? '-',
  },
  {
    header: t('partnershipVehicle:list.column.healthcare_consumer'),
    accessorKey: 'healthcare_consumer',
    id: 'healthcare_consumer',
    size: 250,
    enableSorting: false,
    cell: ({ row: { original } }) => original.entityName ?? '-',
  },
  {
    header: t('partnershipVehicle:list.column.action'),
    accessorKey: 'action',
    id: 'action',
    meta: {
      hidden: loggedAsAdmin(),
    },
    size: 160,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-0.5">
          <ButtonActionTable
            id={original?.id}
            path={`partnership-vehicle`}
            hidden={['activation', 'detail']}
          />
          <Button
            onClick={() =>
              handleDeletePartnershipVehicle &&
              handleDeletePartnershipVehicle(original.id)
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
