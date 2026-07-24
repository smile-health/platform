import { getInternalTreatmentOptions } from '@/components/waste-source/utils/helper';
import i18n from '@/locales/i18n';
import { TWasteTransaction } from '@/types/transaction';
import { isFacilityAdmin, isSanitarian } from '@/utils/getUserRole';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
};

export const ColumnsTransaction = (
  t: TFunction<['common', 'transaction']>,
  { page, size }: DataProps
): ColumnDef<TWasteTransaction>[] => {
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 50,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: t('transaction:list.column.waste_group_code'),
      accessorKey: 'waste_group_code',
      id: 'waste_group_code',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) => original.wasteGroupNumber ?? '-',
    },
    {
      header: t('transaction:list.column.healthcare_facility'),
      accessorKey: 'healthcare_facility',
      id: 'healthcare_facility',
      size: 200,
      meta: {
        hidden: isSanitarian() || isFacilityAdmin(),
      },
      enableSorting: false,
      cell: ({ row: { original } }) => original.healthcareFacilityName ?? '-',
    },
    {
      header: t('transaction:list.column.waste_code'),
      accessorKey: 'waste_code',
      id: 'waste_code',
      size: 100,
      enableSorting: false,
      cell: ({ row: { original } }) => original.wasteCode ?? '-',
    },
    {
      header: t('transaction:list.column.waste_bag_code'),
      accessorKey: 'waste_bag_code',
      id: 'waste_bag_code',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.qrCode ?? '-',
    },
    {
      header: t('transaction:list.column.waste_characteristic'),
      accessorKey: 'waste_characteristic',
      id: 'waste_characteristic',
      size: 200,
      enableSorting: false,
      cell: function WasteCharacteristicCell({ row: { original } }) {
        return (
          <>
            {i18n.language === 'id'
              ? original.wasteTypeName
              : original.wasteTypeNameEn}{' '}
            /{' '}
            {i18n.language === 'id'
              ? original.wasteGroupName
              : original.wasteGroupNameEn}{' '}
            /{' '}
            {i18n.language === 'id'
              ? original.wasteCharacteristicsName
              : original.wasteCharacteristicsNameEn}
          </>
        );
      },
    },
    {
      header: t('transaction:list.column.healthcare_facility'),
      accessorKey: 'healthcare_facility',
      id: 'healthcare_facility',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.healthcareFacilityName ?? '-',
    },
    {
      header: t('transaction:list.column.waste_in_date'),
      accessorKey: 'waste_in_date',
      id: 'waste_in_date',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.checkInDate
          ? dayjs(original.checkInDate).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: t('transaction:list.column.waste_source'),
      accessorKey: 'waste_source',
      id: 'waste_source',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        const treatment = getInternalTreatmentOptions().find(
          (option) => option.value === original.wasteSource
        );
        return treatment?.label ?? original.wasteSource;
      },
    },
    {
      header: t('transaction:list.column.waste_in_weight', {
        unit,
      }),
      accessorKey: 'waste_in_weight',
      id: 'waste_in_weight',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.weightInKgs),
    },
    {
      header: t('transaction:list.column.storage_date_limit'),
      accessorKey: 'storage_date_limit',
      id: 'storage_date_limit',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.actualStorageEndDatetime
          ? dayjs(original.actualStorageEndDatetime).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: t('transaction:list.column.waste_out_date'),
      accessorKey: 'waste_out_date',
      id: 'waste_out_date',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.checkOutDate
          ? dayjs(original.checkOutDate).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: t('transaction:list.column.waste_out_weight', {
        unit,
      }),
      accessorKey: 'waste_out_weight',
      id: 'waste_out_weight',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.weightOutKgs),
    },
    {
      header: t('transaction:list.column.third_party'),
      accessorKey: 'third_party',
      id: 'third_party',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.thirdPartyName ?? '-',
    },
    {
      header: t('transaction:list.column.manifest_number'),
      accessorKey: 'manifest_number',
      id: 'manifest_number',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.manifestDocNumber ?? '-',
    },
    {
      header: t('transaction:list.column.remaining_waste_at_collection_place', {
        unit,
      }),
      accessorKey: 'remaining_waste_at_collection_place',
      id: 'remaining_waste_at_collection_place',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        const inKgs = parseFloat(original.weightInKgs);
        const outKgs = parseFloat(original.weightOutKgs);
        const result = inKgs - outKgs;
        return formatWasteBagWeight(result);
      },
    },
  ];
};
