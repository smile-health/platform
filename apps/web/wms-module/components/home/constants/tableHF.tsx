import { getInternalTreatmentOptions } from '@/components/waste-source/utils/helper';
import i18n from '@/locales/i18n';
import { TWasteTrackingDetail, TWasteTransaction } from '@/types/transaction';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { mapWasteStatus } from '@/utils/mappingWasteStatus';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
  handleHomeHFDetail?: (data: TWasteTransaction) => void;
};

export const ColumnsHomeHF = (
  t: TFunction<['common', 'home']>,
  { page, size, handleHomeHFDetail }: DataProps
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
      header: t('home:home_hf.column.waste_number'),
      accessorKey: 'waste_number',
      id: 'waste_number',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.qrCode ?? '-',
    },
    {
      header: t('home:home_hf.column.waste_transporter'),
      accessorKey: 'waste_transporter',
      id: 'waste_transporter',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.transporterName ?? '-',
    },
    {
      header: t('home:home_hf.column.waste_treatment'),
      accessorKey: 'waste_treatment',
      id: 'waste_treatment',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.thirdPartyName ?? '-',
    },
    {
      header: t('home:home_hf.column.waste_hierarchy'),
      accessorKey: 'waste_transaction_group',
      id: 'waste_transaction_group',
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
      header: t('home:home_hf.column.waste_source'),
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
      header: t('home:home_hf.column.waste_date'),
      accessorKey: 'waste_date',
      id: 'waste_date',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.createdAt
          ? dayjs(original.createdAt).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: t('home:home_hf.column.storage_date_limit'),
      accessorKey: 'storage_date_limit',
      id: 'storage_date_limit',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.storageMax ?? '-',
    },
    {
      header: t('home:home_hf.column.weight', {
        unit,
      }),
      accessorKey: 'weight',
      id: 'weight',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.weightInKgs),
    },
    {
      header: t('home:home_hf.column.action'),
      accessorKey: 'action',
      id: 'action',
      meta: {
        hidden: loggedAsAdmin(),
      },
      size: 160,
      cell: ({ row: { original } }) => {
        return (
          <Button
            onClick={() => handleHomeHFDetail && handleHomeHFDetail(original)}
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

export const ColumnsHomeHFDetail = (
  t: TFunction<['common', 'home']>
): ColumnDef<TWasteTrackingDetail>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => index + 1,
  },
  {
    header: t('home:home_hf.modal.waste_status'),
    accessorKey: 'waste_type',
    id: 'waste_type',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      mapWasteStatus(original.wasteStatus, original.disposalMethod),
  },
  {
    header: t('home:home_hf.modal.updated_status'),
    accessorKey: 'waste_group',
    id: 'waste_group',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      original.wasteBagStatusUpdateDate
        ? dayjs(original.wasteBagStatusUpdateDate).format('DD/MM/YYYY HH:mm')
        : '-',
  },
];
