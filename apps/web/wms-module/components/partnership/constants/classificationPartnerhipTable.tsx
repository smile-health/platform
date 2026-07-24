import { TClassificationPartnership } from '@/types/partnership';
import { getCurrencySymbol, numberFormatter } from '@/utils/formatter';
import { Badge } from '@repo/ui/components/badge';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import {
  getPartnershipStatusOptions,
  getProviderTypeOptions,
} from '../utils/helper';

export const columnsClassificationPartnerhipTable = (
  t: TFunction<['common', 'partnership']>
): ColumnDef<TClassificationPartnership>[] => {
  const options = getPartnershipStatusOptions();
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 50,
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t(
        'partnership:list.column_classification_partnership.waste_characteristics'
      ),
      accessorKey: 'waste_characteristics',
      id: 'waste_characteristics',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original?.wasteCharacteristicsName ?? '-',
    },
    {
      header: t(
        'partnership:list.column_classification_partnership.waste_code'
      ),
      accessorKey: 'waste_code',
      id: 'waste_code',
      size: 120,
      enableSorting: false,
      cell: ({ row: { original } }) => original?.wasteCode ?? '-',
    },
    {
      header: t('partnership:list.column_classification_partnership.price'),
      accessorKey: 'price',
      id: 'price',
      size: 120,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        getCurrencySymbol() + ' ' + numberFormatter(Number(original?.price)),
    },
    {
      header: t(
        'partnership:list.column_classification_partnership.partnership_type'
      ),
      accessorKey: 'partnership_type',
      id: 'partnership_type',
      size: 180,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        getProviderTypeOptions().find(
          (option) => option.value === original.providerType
        )?.label,
    },
    {
      header: t(
        'partnership:list.column_classification_partnership.contract_start_date'
      ),
      accessorKey: 'contractStartDate',
      id: 'contract_start_date',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.contractStartDate
          ? dayjs(original.contractStartDate).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: t(
        'partnership:list.column_classification_partnership.contract_end_date'
      ),
      accessorKey: 'contract_end_date',
      id: 'contract_end_date',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.contractEndDate
          ? dayjs(original.contractEndDate).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: t(
        'partnership:list.column_classification_partnership.contract_id'
      ),
      accessorKey: 'contract_id',
      id: 'contract_id',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) => original?.contractId ?? '-',
    },
    {
      header: t(
        'partnership:list.column_classification_partnership.partnership_status'
      ),
      accessorKey: 'partnership_status',
      id: 'partnership_status',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        const status = options.find(
          (s) => s.value === original.partnershipStatus
        );
        return (
          <Badge
            rounded="full"
            color={status?.color ?? 'primary'}
            variant="light"
          >
            {status?.label ?? '-'}
          </Badge>
        );
      },
    },
  ];
};
