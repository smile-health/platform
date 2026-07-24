import i18n from '@/locales/i18n';
import { TWasteGroup, TWasteGroupDetail, WasteBag } from '@/types/waste-group';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

type FormatWeightFn = (value: string | number) => string;

export const ColumnsWasteGroupDetail = (
  t: TFunction<['common', 'logbook']>,
  formatWasteBagWeight: FormatWeightFn,
  unit: string
): ColumnDef<TWasteGroup>[] => {
  return [
    {
      id: 'expander',
      size: 5,
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
          className="ui-text-gray-500 hover:ui-text-black"
        >
          {row.getIsExpanded() ? '▼' : '▶'}
        </button>
      ),
    },
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 30,
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t('logbook:list.column_detail.waste_bag'),
      accessorKey: 'wasteQrCode',
      id: 'waste_bag',
      size: 130,
      enableSorting: false,
      cell: ({ row: { original } }) => original.wasteQrCode ?? '-',
    },
    {
      header: t('logbook:list.column_detail.waste_characteristic'),
      accessorKey: 'wasteTypeName',
      id: 'waste_type',
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
      header: t('logbook:list.column_detail.weight', {
        unit,
      }),
      accessorKey: 'wasteWeight',
      id: 'weight',
      size: 120,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.wasteWeight),
    },
  ];
};

export const ColumnsWasteGroupDetailItem = (
  t: TFunction<['common', 'logbook']>,
  formatWasteBagWeight: FormatWeightFn,
  unit: string
): ColumnDef<TWasteGroupDetail>[] => {
  return [
    {
      id: 'expander',
      size: 5,
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
          className="ui-text-gray-500 hover:ui-text-black"
        >
          {row.getIsExpanded() ? '▼' : '▶'}
        </button>
      ),
    },
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 30,
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t('logbook:list.column_detail.waste_group'),
      accessorKey: 'groupId',
      id: 'groupId',
      size: 130,
      enableSorting: false,
      cell: ({ row: { original } }) => original.groupId ?? '-',
    },
    {
      header: t('logbook:list.column_detail.waste_characteristic'),
      accessorKey: 'wasteTypeName',
      id: 'waste_type',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => (
        <>
          {original.wasteTypeName ?? '-'} / {original.wasteGroupName ?? '-'} /{' '}
          {original.wasteCharacteristicsName ?? '-'}
        </>
      ),
    },
    {
      header: t('logbook:list.column_detail.weight', {
        unit,
      }),
      accessorKey: 'totalWeightInKgs',
      id: 'weight',
      size: 120,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.totalWeightInKgs),
    },
  ];
};

export const ColumnsWasteBagDetailItem = (
  t: TFunction<['common', 'logbook']>,
  formatWasteBagWeight: FormatWeightFn,
  unit: string
): ColumnDef<WasteBag>[] => {
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 30,
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t('logbook:list.column_detail.waste_bag'),
      accessorKey: 'wasteBagQrcodeId',
      id: 'wasteBagQrcodeId',
      size: 130,
      enableSorting: false,
      cell: ({ row: { original } }) => original.wasteBagQrcodeId ?? '-',
    },
    {
      header: t('logbook:list.column_detail.waste_characteristic'),
      accessorKey: 'wasteTypeName',
      id: 'waste_type',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => (
        <>
          {original.wasteTypeName ?? '-'} / {original.wasteGroupName ?? '-'} /{' '}
          {original.wasteCharacteristicsName ?? '-'}
        </>
      ),
    },

    {
      header: t('logbook:list.column_detail.weight', {
        unit,
      }),
      accessorKey: 'weightInKgs',
      id: 'weightInKgs',
      size: 120,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        formatWasteBagWeight(original.weightInKgs),
    },
  ];
};
