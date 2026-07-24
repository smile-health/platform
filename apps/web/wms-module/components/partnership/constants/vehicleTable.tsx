import { formatAllowedVehicleTypes } from '@/components/waste-specification/utils/helper';
import i18n from '@/locales/i18n';
import { TPartnershipVehicle } from '@/types/partnership-vehicle';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

export const columnsVehicleTable = (
  t: TFunction<['common', 'partnership']>
): ColumnDef<TPartnershipVehicle>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => index + 1,
  },
  {
    header: t('partnership:list.column_vehicle.vehicle_type '),
    accessorKey: 'vehicle_type',
    id: 'vehicle_type',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      formatAllowedVehicleTypes(original?.vehicleType),
  },
  {
    header: t('partnership:list.column_vehicle.vehicle_number'),
    accessorKey: 'vehicle_number',
    id: 'vehicle_number',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original?.vehicleNumber ?? '-',
  },
  {
    header: t('partnership:list.column_vehicle.capacity'),
    accessorKey: 'capacity',
    id: 'capacity',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      if (original?.capacityInKgs == null) return '0';
      const num = Number(original.capacityInKgs);
      if (isNaN(num)) return '0';

      return new Intl.NumberFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(num);
    },
  },
];
