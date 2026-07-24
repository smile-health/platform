import i18n from '@/locales/i18n';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

interface WasteClassificationRow {
  wasteTypeName: string;
  wasteTypeNameEn: string;
  wasteTypeDescription: string;
  wasteTypeDescriptionEn: string;
  wasteGroupName: string;
  wasteGroupNameEn: string;
  wasteGroupDescription: string;
  wasteGroupDescriptionEn: string;
  wasteCharacteristicsName: string;
  wasteCharacteristicsNameEn: string;
  wasteCharacteristicsDescription: string;
  wasteCharacteristicsDescriptionEn: string;
  typeRowSpan?: number;
  groupRowSpan?: number;
}

export const columnsWasteClassification = (
  t: TFunction<['common', 'wasteClassification']>
): ColumnDef<WasteClassificationRow>[] => {
  return [
    {
      header: t('wasteClassification:list.column.waste_type'),
      accessorKey: 'wasteTypeName',
      id: 'wasteTypeName',
      size: 200,
      meta: {
        rowSpan: (row) => row.original.typeRowSpan ?? 0,
        cellClassName: ({ original }) =>
          original.typeRowSpan
            ? ' ui-border-r ui-border-gray-200'
            : 'ui-hidden',
      },
      cell: ({ row }) =>
        i18n.language === 'id'
          ? row.original.typeRowSpan
            ? row.original.wasteTypeName
            : null
          : row.original.typeRowSpan
            ? row.original.wasteTypeNameEn
            : null,
    },
    {
      header: t('wasteClassification:list.column.waste_type_description'),
      accessorKey: 'wasteTypeDescription',
      id: 'wasteTypeDescription',
      size: 300,
      meta: {
        rowSpan: (row) => row.original.typeRowSpan ?? 0,
        cellClassName: ({ original }) =>
          original.typeRowSpan
            ? ' ui-border-r ui-border-gray-200'
            : 'ui-hidden',
      },
      cell: ({ row }) =>
        i18n.language === 'id'
          ? row.original.typeRowSpan
            ? row.original.wasteTypeDescription || '-'
            : null
          : row.original.typeRowSpan
            ? row.original.wasteTypeDescriptionEn || '-'
            : null,
    },
    {
      header: t('wasteClassification:list.column.waste_group'),
      accessorKey: 'wasteGroupName',
      id: 'wasteGroupName',
      size: 200,
      meta: {
        rowSpan: (row) => row.original.groupRowSpan ?? 0,
        cellClassName: ({ original }) =>
          original.groupRowSpan
            ? ' ui-border-r ui-border-gray-200'
            : 'ui-hidden',
      },
      cell: ({ row }) =>
        i18n.language === 'id'
          ? row.original.groupRowSpan
            ? row.original.wasteGroupName
            : null
          : row.original.groupRowSpan
            ? row.original.wasteGroupNameEn
            : null,
    },
    {
      header: t('wasteClassification:list.column.waste_group_description'),
      accessorKey: 'wasteGroupDescription',
      id: 'wasteGroupDescription',
      size: 300,
      meta: {
        rowSpan: (row) => row.original.groupRowSpan ?? 0,
        cellClassName: ({ original }) =>
          original.groupRowSpan
            ? ' ui-border-r ui-border-gray-200'
            : 'ui-hidden',
      },
      cell: ({ row }) =>
        i18n.language === 'id'
          ? row.original.groupRowSpan
            ? row.original.wasteGroupDescription || '-'
            : null
          : row.original.groupRowSpan
            ? row.original.wasteGroupDescriptionEn || '-'
            : null,
    },
    {
      header: t('wasteClassification:list.column.waste_characteristics'),
      accessorKey: 'wasteCharacteristicsName',
      id: 'wasteCharacteristicsName',
      size: 200,
      cell: ({ row }) =>
        i18n.language === 'id'
          ? row.original.wasteCharacteristicsName
          : row.original.wasteCharacteristicsNameEn,
      meta: {
        cellClassName:
          'font-medium text-gray-700 ui-border-r ui-border-gray-200',
      },
    },
    {
      header: t(
        'wasteClassification:list.column.waste_characteristics_description'
      ),
      accessorKey: 'wasteCharacteristicsDescription',
      id: 'wasteCharacteristicsDescription',
      size: 300,
      cell: ({ row }) =>
        i18n.language === 'id'
          ? row.original.wasteCharacteristicsDescription ||
            'Tidak ada deskripsi'
          : row.original.wasteCharacteristicsDescriptionEn || 'No description',
      meta: {
        cellClassName: 'text-gray-600',
      },
    },
  ];
};
