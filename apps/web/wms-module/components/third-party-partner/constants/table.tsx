import { ButtonActionTable } from '@/components/ButtonActionTable';
import { getPartnershipStatusOptions } from '@/components/partnership/utils/helper';
import i18n from '@/locales/i18n';
import { TPartnership } from '@/types/partnership';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import { getProviderTypeOptions } from '../utils/helper';

type DataProps = {
  page: number;
  size: number;
  handleDeleteThirdPartyPartner?: (id: number) => void;
};

export const columnsThirdPartyPartner = (
  t: TFunction<['common', 'thirdPartyPartner']>,
  { page, size, handleDeleteThirdPartyPartner }: DataProps
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
      header: t('thirdPartyPartner:list.column.partnership_type'),
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
      header: t('thirdPartyPartner:list.column.third_party_name'),
      accessorKey: 'third_party_name',
      id: 'third_party_name',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.providerName ?? '-',
    },
    {
      header: t('thirdPartyPartner:list.column.healthcare_partner'),
      accessorKey: 'healthcare_partner',
      id: 'healthcare_partner',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.consumerName ?? '-',
    },
    {
      header: t('thirdPartyPartner:list.column.waste_characteristic'),
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
      header: t('thirdPartyPartner:list.column.contract_id'),
      accessorKey: 'contract_id',
      id: 'contract_id',
      size: 150,
      enableSorting: false,
      cell: ({ row: { original } }) => original.contractId ?? '-',
    },
    {
      header: t('thirdPartyPartner:list.column.contract_start_date'),
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
      header: t('thirdPartyPartner:list.column.contract_end_date'),
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
      header: t('thirdPartyPartner:list.column.partnership_status'),
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
      header: t('thirdPartyPartner:list.column.action'),
      accessorKey: 'action',
      id: 'action',
      meta: {
        hidden: loggedAsAdmin(),
      },
      size: 160,
      cell: ({ row: { original } }) => {
        return (
          <div className="ui-flex ui-gap-0.5">
            <ButtonActionTable
              id={original?.id}
              path={`third-party-partner`}
              hidden={['activation']}
            />
            <Button
              onClick={() =>
                handleDeleteThirdPartyPartner &&
                handleDeleteThirdPartyPartner(original.id)
              }
              type="button"
              variant="subtle"
              className="!ui-px-1.5 ui-text-danger-500"
            >
              {t('common:remove')}
            </Button>
          </div>
        );
      },
    },
  ];
};
