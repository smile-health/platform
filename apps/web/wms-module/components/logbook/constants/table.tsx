import { TLogbook } from '@/types/logbook';
import { isFacilityAdmin, isSanitarian, loggedAsAdmin } from '@/utils/getUserRole';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
  handleDisposalDetail?: (data: TLogbook) => void;
};

const ActionCell = ({
  original,
  handleDisposalDetail,
  t,
}: {
  original: TLogbook;
  handleDisposalDetail?: (data: TLogbook) => void;
  t: TFunction<['common', 'logbook']>;
}) => (
  <Button
    onClick={() => handleDisposalDetail?.(original)}
    type="button"
    variant="subtle"
    className="!ui-px-1.5 ui-text-blue-800"
  >
    {t('common:detail')}
  </Button>
);
ActionCell.displayName = 'ActionCell';

const CellContent = ({
  original,
  handleDisposalDetail,
  t,
}: {
  original: TLogbook;
  handleDisposalDetail?: (data: TLogbook) => void;
  t: TFunction<['common', 'logbook']>;
}) => (
  <ActionCell
    original={original}
    handleDisposalDetail={handleDisposalDetail}
    t={t}
  />
);
CellContent.displayName = 'CellContent';

export const ColumnsLogbook = (
  t: TFunction<['common', 'logbook']>,
  { page, size, handleDisposalDetail }: DataProps
): ColumnDef<TLogbook>[] => {
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
      header: t('logbook:list.column.waste_group_number'),
      accessorKey: 'waste_transaction_group',
      id: 'waste_transaction_group',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.wasteGroupNumber ?? '-',
    },
    {
      header: t('logbook:list.column.healthcare_facility'),
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
      header: t('logbook:list.column.weight', {
        unit,
      }),
      accessorKey: 'weight',
      id: 'weight',
      size: 130,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.totalWeightInKgs),
    },
    {
      header: t('logbook:list.column.third_party'),
      accessorKey: 'third_party',
      id: 'third_party',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.thirdPartyName ?? '-',
    },
    {
      header: t('logbook:list.column.transport_officer'),
      accessorKey: 'transport_officer',
      id: 'transport_officer',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.operatorName ?? '-',
    },
    {
      header: t('logbook:list.column.vehicle_number'),
      accessorKey: 'vehicle_number',
      id: 'vehicle_number',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.vehicleNumber ?? '-',
    },
    {
      header: t('logbook:list.column.drop_time'),
      accessorKey: 'drop_time',
      id: 'drop_time',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.dropTime
          ? dayjs(original.dropTime).format('DD/MM/YYYY HH:mm')
          : '-',
    },
    {
      header: t('logbook:list.column.pickup_time'),
      accessorKey: 'pickup_time',
      id: 'pickup_time',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.pickupTime
          ? dayjs(original.pickupTime).format('DD/MM/YYYY HH:mm')
          : '-',
    },
    {
      header: t('logbook:list.column.process_time'),
      accessorKey: 'process_time',
      id: 'process_time',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.processTime
          ? dayjs(original.processTime).format('DD/MM/YYYY HH:mm')
          : '-',
    },
    {
      header: t('logbook:list.column.landfill_time'),
      accessorKey: 'landfill_time',
      id: 'landfill_time',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.landfillTime
          ? dayjs(original.landfillTime).format('DD/MM/YYYY HH:mm')
          : '-',
    },
    {
      header: t('logbook:list.column.recycle_time'),
      accessorKey: 'recycle_time',
      id: 'recycle_time',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.recycleTime
          ? dayjs(original.recycleTime).format('DD/MM/YYYY HH:mm')
          : '-',
    },
    {
      header: t('logbook:list.column.action'),
      accessorKey: 'action',
      id: 'action',
      meta: {
        hidden: loggedAsAdmin(),
      },
      size: 160,
      cell: (({ row: { original } }: { row: { original: TLogbook } }) => (
        <CellContent
          original={original}
          handleDisposalDetail={handleDisposalDetail}
          t={t}
        />
      )) as any,
    },
  ];
};
