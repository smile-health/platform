import { ButtonActionTable } from '@/components/ButtonActionTable';
import { getPartnershipStatusOptions } from '@/components/partnership/utils/helper';
import { TPartnership } from '@/types/partnership';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { Badge } from '@repo/ui/components/badge';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import i18n from '@/locales/i18n';

type DataProps = {
  page: number;
  size: number;
};

export const columnsHealthcarePartner = (
  t: TFunction<['common', 'healthcarePartner']>,
  { page, size }: DataProps
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
      header: t('healthcarePartner:list.column.healthcare_facility'),
      accessorKey: 'healthcare_facility',
      id: 'healthcare_facility',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.consumerName ?? '-',
    },
    {
      header: t('healthcarePartner:list.column.province'),
      accessorKey: 'province',
      id: 'province',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.consumerProvinceName ?? '-',
    },
    {
      header: t('healthcarePartner:list.column.city'),
      accessorKey: 'city',
      id: 'city',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.consumerCityName ?? '-',
    },
    {
      header: t('healthcarePartner:list.column.waste_characteristic'),
      accessorKey: 'waste_characteristic',
      id: 'waste_characteristic',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        i18n.language === 'id'
          ? original.wasteClassification?.wasteCharacteristics?.name
          : original.wasteClassification?.wasteCharacteristics?.nameEn ?? '-',
    },
    {
      header: t('healthcarePartner:list.column.contract_start_date'),
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
      header: t('healthcarePartner:list.column.contract_end_date'),
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
      header: t('healthcarePartner:list.column.partnership_status'),
      accessorKey: 'partnership_status',
      id: 'asset_status',
      size: 180,
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
      header: t('healthcarePartner:list.column.action'),
      accessorKey: 'action',
      id: 'action',
      meta: {
        hidden: loggedAsAdmin(),
      },
      size: 160,
      cell: ({ row: { original } }) => {
        return (
          <ButtonActionTable
            id={original?.id}
            path={`healthcare-partner`}
            hidden={['activation', 'edit']}
          />
        );
      },
    },
  ];
};
