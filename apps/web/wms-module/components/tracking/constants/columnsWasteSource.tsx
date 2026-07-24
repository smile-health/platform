import {
  getInternalTreatmentOptions,
  getSourceTypeOptions,
} from '@/components/waste-source/utils/helper';
import { TWasteTrackingWasteSource } from '@/types/tracking';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

export const ColumnsWasteSource = (
  t: TFunction<['common', 'tracking']>
): ColumnDef<TWasteTrackingWasteSource>[] => {
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();
  return [
    {
      header: t('tracking:list.column_waste_source.source_type'),
      accessorKey: 'source_type',
      id: 'source_type',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        const options = getSourceTypeOptions();
        const source = options.find((s) => s.value === original?.sourceType);
        return <span>{source?.label ?? '-'}</span>;
      },
    },
    {
      header: t('tracking:list.column_waste_source.waste_source_name'),
      accessorKey: 'waste_source_name',
      id: 'waste_source_name',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        const treatment = getInternalTreatmentOptions().find(
          (option) => option.value === original.wasteSourceName
        );
        return treatment?.label ?? original.wasteSourceName;
      },
    },
    {
      header: t('tracking:list.column_waste_source.total_waste_bag'),
      accessorKey: 'total_waste_bag',
      id: 'total_waste_bag',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.totalWasteBag ?? '-',
    },
    {
      header: t('tracking:list.column_waste_source.total_weight_in_kgs', {
        unit,
      }),
      accessorKey: 'total_weight_in_kgs',
      id: 'total_weight_in_kgs',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.totalWeightInKgs
          ? formatWasteBagWeight(original.totalWeightInKgs)
          : '-',
    },
  ];
};
