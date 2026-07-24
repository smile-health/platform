import { TWasteGroupTP } from '@/types/homepage';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import { ProviderTypeTP } from './constant.home';

type DataProps = {
  page: number;
  size: number;
  handleHomeTPDetail?: (data: TWasteGroupTP) => void;
  sectionTab?: string;
};

export const ColumnsHomeTPTransport = (
  t: TFunction<['common', 'home']>,
  { page, size, handleHomeTPDetail, sectionTab }: DataProps
): ColumnDef<TWasteGroupTP>[] => {
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();
  let handover = t('home:home_tp.tab.transport');
  if (sectionTab === ProviderTypeTP.TREATMENT) {
    handover = t('home:home_tp.tab.treatment');
  } else if (sectionTab === ProviderTypeTP.RECYCLER) {
    handover = t('home:home_tp.tab.recycle');
  } else if (sectionTab === ProviderTypeTP.LANDFILLER) {
    handover = t('home:home_tp.tab.landfill');
  } else if (sectionTab === ProviderTypeTP.GOVERNMENT) {
    handover = t('home:home_tp.tab.government');
  } else if (sectionTab === ProviderTypeTP.SPECIALIZED) {
    handover = t('home:home_tp.tab.specialized');
  } else if (sectionTab === ProviderTypeTP.GOVERNMENT_WASTE_BANK) {
    handover = t('home:home_tp.tab.waste_bank');
  }
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 50,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: t('home:home_tp.transport_tab.column.entity_name'),
      accessorKey: 'entity_name',
      id: 'entity_name',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        sectionTab === ProviderTypeTP.TREATMENT
          ? original.transporterName ?? '-'
          : original.healthcareName ?? '-',
    },
    {
      header: t('home:home_tp.transport_tab.column.waste_group_number'),
      accessorKey: 'waste_group_number',
      id: 'waste_group_number',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) => original.wasteGroupNumber ?? '-',
    },
    {
      header: t('home:home_tp.transport_tab.column.waste_weight', {
        unit,
      }),
      accessorKey: 'waste_weight',
      id: 'waste_weight',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.totalWeightInKgs ?? 0),
    },
    {
      header: t('home:home_tp.transport_tab.column.transport_officer'),
      accessorKey: 'transport_officer',
      id: 'transport_officer',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.transporterOperatorName ?? '-',
    },
    {
      header: t('home:home_tp.transport_tab.column.treatment_operator'),
      accessorKey: 'treatment_operator',
      id: 'treatment_operator',
      size: 200,
      meta: {
        hidden: sectionTab !== ProviderTypeTP.TREATMENT,
      },
      enableSorting: false,
      cell: ({ row: { original } }) => original.treatmentOperatorName ?? '-',
    },
    {
      header: t('home:home_tp.transport_tab.column.vehicle_number'),
      accessorKey: 'vehicle_number',
      id: 'vehicle_number',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) => original.vehicleNumber ?? '-',
    },
    {
      header: t(
        'home:home_tp.transport_tab.column.handover_time_to_transport',
        {
          handover,
        }
      ),
      accessorKey: 'handover_time_to_transport',
      id: 'handover_time_to_transport',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.handOverTime
          ? dayjs(original.handOverTime).format('DD/MM/YYYY HH:mm')
          : '-',
    },
    {
      header: t('home:home_tp.transport_tab.column.action'),
      accessorKey: 'action',
      id: 'action',
      meta: {
        hidden: loggedAsAdmin(),
      },
      size: 160,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        return (
          <Button
            onClick={() => handleHomeTPDetail && handleHomeTPDetail(original)}
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
