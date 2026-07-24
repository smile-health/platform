import { ButtonActionTable } from '@/components/ButtonActionTable';
import i18n from '@/locales/i18n';
import {
  TWasteCharacteristic,
  TWasteGroup,
  TWasteHierarchy,
} from '@/types/waste-hierarchy';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
  tab: string;
  handleDeleteWasteHierarchy?: (id: number) => void;
};

export const columnsWasteType = (
  t: TFunction<['common', 'wasteHierarchy']>,
  { page, size, tab, handleDeleteWasteHierarchy }: DataProps
): ColumnDef<TWasteHierarchy>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('wasteHierarchy:list.column.waste_type'),
    accessorKey: 'waste_type',
    id: 'waste_type',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id' ? original.name : original.nameEn) ?? '-',
  },
  {
    header: t('wasteHierarchy:list.column.description'),
    accessorKey: 'description',
    id: 'description',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original.description
        : original.descriptionEn) ?? '-',
  },
  {
    header: t('wasteHierarchy:list.column.updated_at'),
    accessorKey: 'updated_at',
    id: 'updated_at',
    size: 150,
    enableSorting: false,
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
    header: t('wasteHierarchy:list.column.action'),
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
            path={`waste-hierarchy/${tab}`}
            hidden={['detail', 'activation']}
          />
          <Button
            onClick={() =>
              handleDeleteWasteHierarchy &&
              handleDeleteWasteHierarchy(original.id)
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

export const columnsWasteGroup = (
  t: TFunction<['common', 'wasteHierarchy']>,
  { page, size, tab, handleDeleteWasteHierarchy }: DataProps
): ColumnDef<TWasteGroup>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('wasteHierarchy:list.column.waste_type'),
    accessorKey: 'waste_type',
    id: 'waste_type',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original?.wasteType?.name
        : original?.wasteType?.nameEn) ?? '-',
  },
  {
    header: t('wasteHierarchy:list.column.waste_group'),
    accessorKey: 'waste_group',
    id: 'waste_group',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id' ? original.name : original.nameEn) ?? '-',
  },
  {
    header: t('wasteHierarchy:list.column.description'),
    accessorKey: 'description',
    id: 'description',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original.description
        : original.descriptionEn) ?? '-',
  },
  {
    header: t('wasteHierarchy:list.column.updated_at'),
    accessorKey: 'updated_at',
    id: 'updated_at',
    size: 150,
    enableSorting: false,
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
    header: t('wasteHierarchy:list.column.action'),
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
            path={`waste-hierarchy/${tab}`}
            hidden={['detail', 'activation']}
          />
          <Button
            onClick={() =>
              handleDeleteWasteHierarchy &&
              handleDeleteWasteHierarchy(original.id)
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

export const columnsWasteCharacteristic = (
  t: TFunction<['common', 'wasteHierarchy']>,
  { page, size, tab }: DataProps
): ColumnDef<TWasteCharacteristic>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('wasteHierarchy:list.column.waste_type'),
    accessorKey: 'waste_type',
    id: 'waste_type',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original?.wasteType?.name
        : original?.wasteType?.nameEn) ?? '-',
  },
  {
    header: t('wasteHierarchy:list.column.waste_group'),
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
    header: t('wasteHierarchy:list.column.waste_characteristic'),
    accessorKey: 'waste_characteristic',
    id: 'waste_characteristic',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id' ? original.name : original.nameEn) ?? '-',
  },
  {
    header: t('wasteHierarchy:list.column.description'),
    accessorKey: 'description',
    id: 'description',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original.description
        : original.descriptionEn) ?? '-',
  },
  {
    header: t('wasteHierarchy:list.column.updated_at'),
    accessorKey: 'updated_at',
    id: 'updated_at',
    size: 150,
    enableSorting: false,
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
    header: t('wasteHierarchy:list.column.status'),
    accessorKey: 'status',
    id: 'status',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      return (
        <Badge
          rounded="full"
          color={original.isActive ? 'success' : 'danger'}
          variant="light"
        >
          {original.isActive
            ? t('wasteHierarchy:form.status.active')
            : t('wasteHierarchy:form.status.non_active')}
        </Badge>
      );
    },
  },
  {
    header: t('wasteHierarchy:list.column.action'),
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
            path={`waste-hierarchy/${tab}`}
            hidden={['detail', 'activation']}
          />
        </div>
      );
    },
  },
];
