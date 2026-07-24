import { getInternalTreatmentOptions } from '@/components/waste-source/utils/helper';
import i18n from '@/locales/i18n';
import { TWasteTransaction } from '@/types/transaction';
import { isFacilityAdmin, isSanitarian, loggedAsAdmin } from '@/utils/getUserRole';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { mapWasteStatus } from '@/utils/mappingWasteStatus';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
  handleTrackingDetail?: (data: TWasteTransaction) => void;
};

export const ColumnsWasteBag = (
  t: TFunction<['common', 'tracking']>,
  { page, size, handleTrackingDetail }: DataProps
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
      header: t('tracking:list.column_waste_bag.waste_bag_code'),
      accessorKey: 'waste_bag_code',
      id: 'waste_bag_code',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.qrCode ?? '-',
    },
    {
      header: t('tracking:list.column_waste_bag.healthcare_facility'),
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
      header: t('tracking:list.column_waste_bag.carrier'),
      accessorKey: 'carrier',
      id: 'carrier',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.transporterName ?? '-',
    },
    {
      header: t('tracking:list.column_waste_bag.waste_treatment_facilitator'),
      accessorKey: 'waste_treatment_facilitator',
      id: 'waste_treatment_facilitator',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.thirdPartyName ?? '-',
    },
    {
      header: t('tracking:list.column_waste_bag.waste_characteristic'),
      accessorKey: 'waste_characteristic',
      id: 'waste_characteristic',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => (
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
      ),
    },
    {
      header: t('tracking:list.column_waste_bag.waste_source'),
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
      header: t('tracking:list.column_waste_bag.waste_in_date'),
      accessorKey: 'waste_in_date',
      id: 'waste_in_date',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.createdAt
          ? dayjs(original.createdAt).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: t('tracking:list.column_waste_bag.storage_date_limit'),
      accessorKey: 'storage_date_limit',
      id: 'storage_date_limit',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) => original.storageMax ?? '-',
    },
    {
      header: t('tracking:list.column_waste_bag.status'),
      accessorKey: 'status',
      id: 'status',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        mapWasteStatus(original.wasteStatus, original.disposalMethod),
    },
    {
      header: t('tracking:list.column_waste_bag.weight_kg', {
        unit,
      }),
      accessorKey: 'weight_kg',
      id: 'weight_kg',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.weightInKgs),
    },
    {
      header: t('tracking:list.column_waste_bag.healthcare_facility_operator'),
      accessorKey: 'healthcare_facility_operator',
      id: 'healthcare_facility_operator',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.operatorHealthcareName,
    },
    {
      header: t('tracking:list.column_waste_bag.action'),
      accessorKey: 'action',
      id: 'action',
      meta: {
        hidden: loggedAsAdmin(),
      },
      size: 160,
      cell: ({ row: { original } }) => {
        return (
          <Button
            onClick={() =>
              handleTrackingDetail && handleTrackingDetail(original)
            }
            type="button"
            variant="subtle"
            className="!ui-px-1.5 ui-text-blue-800"
          >
            {t('common:detail')}
          </Button>
        );
      },
    },
  ];
};
