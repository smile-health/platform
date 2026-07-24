import { ButtonActionTable } from '@/components/ButtonActionTable';
import i18n from '@/locales/i18n';
import { TPartnership } from '@/types/partnership';
import { isSuperAdmin, isFacilityAdmin } from '@/utils/getUserRole';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import {
  getPartnershipStatusOptions,
  getProviderTypeOptions,
} from '../utils/helper';

type DataProps = {
  page: number;
  size: number;
  handleDeletePartnership?: (id: number) => void;
};

export const columnsPartnership = (
  tCommon: TFunction<'common'>,
  tPartnership: TFunction<'partnership'>,
  { page, size, handleDeletePartnership }: DataProps
): ColumnDef<TPartnership>[] => {
  const options = getPartnershipStatusOptions();
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 50,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: tPartnership('list.column.entitas_name'),
      accessorKey: 'entitas_name',
      id: 'entitas_name',
      size: 200,
      meta: {
        hidden: !isSuperAdmin(),
      },
      enableSorting: false,
      cell: ({ row: { original } }) => original.consumerName ?? '-',
    },
    {
      header: tPartnership('list.column.partnership_type'),
      accessorKey: 'partnership_type',
      id: 'partnership_type',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        getProviderTypeOptions().find(
          (option) => option.value === original.providerType
        )?.label,
    },
    {
      header: tPartnership('list.column.company_name'),
      accessorKey: 'company_name',
      id: 'company_name',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.providerName ?? '-',
    },
    {
      header: tPartnership('list.column.waste_characteristic'),
      accessorKey: 'waste_characteristic',
      id: 'waste_characteristic',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        (i18n.language === 'id'
          ? original?.wasteClassification?.wasteCharacteristics?.name
          : original?.wasteClassification?.wasteCharacteristics?.nameEn) ?? '-',
    },
    {
      header: tPartnership('list.column.waste_code'),
      accessorKey: 'waste_code',
      id: 'waste_code',
      size: 100,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original?.wasteClassification?.wasteCode ?? '-',
    },
    {
      header: tPartnership('list.column.contract_id'),
      accessorKey: 'contract_id',
      id: 'contract_id',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) => original.contractId ?? '-',
    },
    {
      header: tPartnership('list.column.contract_start_date'),
      accessorKey: 'contract_start_date',
      id: 'contract_start_date',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.contractStartDate
          ? dayjs(original.contractStartDate).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: tPartnership('list.column.contract_end_date'),
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
      header: tPartnership('list.column.partnership_status'),
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
    {
      header: tPartnership('list.column.action'),
      accessorKey: 'action',
      id: 'action',
      size: 160,
      cell: ({ row: { original } }) => {
        return (
          <div className="ui-flex ui-gap-0.5">
            <ButtonActionTable
              id={original?.id}
              path={`partnership`}
              hidden={
                !isFacilityAdmin() ? ['activation', 'edit'] : ['activation']
              }
            />
            {isFacilityAdmin() && (
              <Button
                onClick={() =>
                  handleDeletePartnership &&
                  handleDeletePartnership(original.id)
                }
                type="button"
                variant="subtle"
                className="!ui-px-1.5 ui-text-danger-500"
              >
                {tCommon('remove')}
              </Button>
            )}
          </div>
        );
      },
    },
  ];
};
