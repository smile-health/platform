import { ButtonActionTable } from '@/components/ButtonActionTable';
import i18n from '@/locales/i18n';
import {
  DisposalMethod,
  TWasteSpecification,
} from '@/types/waste-specification';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import {
  getExternalTreatmentOptions,
  getInternalTreatmentOptions,
  toTitleCase,
} from '../utils/helper';

type DataProps = {
  page: number;
  size: number;
};

export const columnsWasteSpecification = (
  t: TFunction<['common', 'wasteSpecification']>,
  { page, size }: DataProps
): ColumnDef<TWasteSpecification>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('wasteSpecification:list.column.waste_code'),
    accessorKey: 'waste_code',
    id: 'wasteCode',
    size: 150,
    enableSorting: true,
    cell: ({ row: { original } }) => original.wasteCode ?? '-',
  },
  {
    header: t('wasteSpecification:list.column.waste_type'),
    accessorKey: 'waste_type',
    id: 'waste_type',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original.wasteType?.name
        : original.wasteType?.nameEn) ?? '-',
  },
  {
    header: t('wasteSpecification:list.column.waste_group'),
    accessorKey: 'waste_group',
    id: 'waste_group',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original?.wasteGroup?.name
        : original?.wasteGroup?.nameEn) ?? '-',
  },
  {
    header: t('wasteSpecification:list.column.waste_characteristic'),
    accessorKey: 'waste_characteristic',
    id: 'waste_characteristic',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original?.wasteCharacteristics?.name
        : original?.wasteCharacteristics?.nameEn) ?? '-',
  },
  {
    header: t('wasteSpecification:list.column.multiple_transporters'),
    accessorKey: 'multiple_transporters',
    id: 'hasMultipleTransporters',
    size: 150,
    enableSorting: true,
    cell: ({ row: { original } }) =>
      original.hasMultipleTransporters ? t('common:yes') : t('common:no'),
  },
  {
    header: t('wasteSpecification:list.column.use_cold_storage'),
    accessorKey: 'use_cold_storage',
    id: 'useColdStorage',
    size: 150,
    enableSorting: true,
    cell: ({ row: { original } }) =>
      original.useColdStorage ? t('common:yes') : t('common:no'),
  },
  {
    header: t('wasteSpecification:list.column.internal_treatment'),
    accessorKey: 'internal_treatment',
    id: 'internal_treatment',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      if (!original.treatmentMethod) return '-';

      const treatmentOptions = getInternalTreatmentOptions();
      const treatments = original.treatmentMethod
        .split(',')
        .map((item) => item.trim())
        .map(
          (code) =>
            treatmentOptions.find((opt) => opt.value === code)?.label || code
        );

      return treatments.length > 0 ? treatments.join(', ') : '-';
    },
  },
  {
    header: t('wasteSpecification:list.column.external_treatment'),
    accessorKey: 'external_treatment',
    id: 'external_treatment',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      if (!original.disposalMethod) return '-';
      const disposalOptions = getExternalTreatmentOptions();

      const formatted = original.disposalMethod
        .split(',')
        .map((item) => item.trim().toUpperCase())
        .map((item) => {
          const matchedEnumValue = Object.values(DisposalMethod).find(
            (enumValue) => enumValue.toUpperCase() === item
          );

          return matchedEnumValue
            ? disposalOptions.find((opt) => opt.value === matchedEnumValue)
                ?.label
            : toTitleCase(item);
        })
        .join(', ');

      return formatted || '-';
    },
  },
  {
    header: t('wasteSpecification:list.column.updated_by'),
    accessorKey: 'updated_by',
    id: 'updatedAt',
    size: 200,
    enableSorting: true,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-flex-col ui-gap-0.5">
          <p>{original.userName}</p>
          <p>
            {original.updatedAt
              ? dayjs(original.updatedAt).format('DD/MM/YYYY')
              : '-'}
          </p>
        </div>
      );
    },
  },
  {
    header: t('wasteSpecification:list.column.action'),
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
          path={'waste-specification'}
          hidden={['activation']}
        />
      );
    },
  },
];
