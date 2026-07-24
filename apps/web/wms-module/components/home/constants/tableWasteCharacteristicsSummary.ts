import { TWasteCharacteristicSummary } from '@/types/homepage';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

export const ColumnsWasteCharacteristicsSummary = (
  t: TFunction<['common', 'home']>
): ColumnDef<TWasteCharacteristicSummary>[] => {
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 50,
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: 'Kode KLHK',
      accessorKey: 'waste_charateristics',
      id: 'waste_charateristics',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.wasteCode ?? '-',
    },
    {
      header: t(
        'home:home_superadmin.modal_waste_characteristics_summary.waste_characteristic'
      ),
      accessorKey: 'waste_charateristics',
      id: 'waste_charateristics',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.wasteCharacteristicsName ?? '-',
    },
    {
      header: t(
        'home:home_superadmin.modal_waste_characteristics_summary.waste_weight',
        {
          unit,
        }
      ),
      accessorKey: 'waste_weight',
      id: 'waste_weight',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.totalWeight ?? 0),
    },
  ];
};
