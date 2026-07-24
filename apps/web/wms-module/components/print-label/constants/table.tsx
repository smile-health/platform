import { TPrintLabel } from '@/types/print-label';
import { SourceType } from '@/types/waste-source';
import { isSanitarian, loggedAsAdmin } from '@/utils/getUserRole';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

import { ButtonActionTable } from '@/components/ButtonActionTable';
import {
  getInternalTreatmentOptions,
  getSourceTypeOptions,
} from '@/components/waste-source/utils/helper';
import i18n from '@/locales/i18n';
import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
import dayjs from 'dayjs';

export const MAX_PRINT_CHARACTERISTICS = 20;

type DataProps = {
  page: number;
  size: number;
  handleDeletePrintLabel?: (id: number) => void;
};

export const columnsPrintLabel = (
  t: TFunction<['common', 'printLabel']>,
  {
    handleDeletePrintLabel,
    setRowSelection,
  }: DataProps & {
    setRowSelection?: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >;
  }
): ColumnDef<TPrintLabel>[] => [
  {
    header: ({ table }) => {
      if (!setRowSelection) return null;

      const pageRows = table.getRowModel().rows;
      const allSelected = pageRows.every((r) => r.getIsSelected());
      const someSelected = pageRows.some((r) => r.getIsSelected());

      // Select-all is capped so the total selected (across pages) never exceeds
      // MAX_PRINT_CHARACTERISTICS.
      const handleToggleAll = () => {
        if (allSelected) {
          pageRows.forEach((r) => r.toggleSelected(false));
          return;
        }
        const totalSelected = Object.values(
          table.getState().rowSelection
        ).filter(Boolean).length;
        let remaining = MAX_PRINT_CHARACTERISTICS - totalSelected;
        for (const row of pageRows) {
          if (remaining <= 0) break;
          if (!row.getIsSelected()) {
            row.toggleSelected(true);
            remaining--;
          }
        }
      };

      return (
        <Checkbox
          checked={allSelected}
          indeterminate={!allSelected && someSelected}
          onChange={handleToggleAll}
        />
      );
    },
    id: 'select',
    size: 50,
    enableSorting: false,
    cell: ({ row }) => {
      if (!setRowSelection) return null;

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      );
    },
  },
  {
    header: t('printLabel:list.column.source_type'),
    accessorKey: 'source_type',
    id: 'source_type',
    size: 150,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      const options = getSourceTypeOptions();
      const source = options.find(
        (s) => s.value === original?.wasteSource?.sourceType
      );
      return <span>{source?.label ?? '-'}</span>;
    },
  },
  {
    header: t('printLabel:list.column.waste_source'),
    accessorKey: 'waste_source',
    id: 'wasteSourceName',
    size: 250,
    minSize: 200,
    enableSorting: true,
    cell: ({ row: { original } }) => {
      const {
        sourceType,
        internalTreatmentName,
        externalHealthcareFacilityName,
        internalSourceName,
      } = original?.wasteSource ?? {};

      switch (sourceType) {
        case SourceType.INTERNAL:
          return internalSourceName ?? '-';
        case SourceType.EXTERNAL:
          return externalHealthcareFacilityName ?? '-';
        case SourceType.INTERNAL_TREATMENT: {
          if (!internalTreatmentName) return '-';
          const treatment = getInternalTreatmentOptions().find(
            (option) => option.value === internalTreatmentName
          );
          return treatment?.label ?? internalTreatmentName;
        }
        default:
          return '-';
      }
    },
  },
  {
    header: t('printLabel:list.column.waste_characteristic'),
    accessorKey: 'waste_characteristic',
    id: 'wasteCharacteristicsName',
    size: 200,
    enableSorting: true,
    cell: ({ row: { original } }) =>
      (i18n.language === 'id'
        ? original?.wasteClassification?.wasteCharacteristics?.name
        : original?.wasteClassification?.wasteCharacteristics?.nameEn) ?? '-',
  },
  {
    header: t('printLabel:list.column.total_label'),
    accessorKey: 'total_label',
    id: 'total_label',
    size: 100,
    enableSorting: false,
    cell: ({ row: { original } }) => original?.labelCount ?? '-',
  },
  {
    header: t('printLabel:list.column.updated_at'),
    accessorKey: 'updated_at',
    id: 'updated_at',
    size: 220,
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
    header: t('printLabel:list.column.action'),
    accessorKey: 'action',
    id: 'action',
    meta: {
      hidden: loggedAsAdmin() || isSanitarian(),
    },
    size: 160,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-0.5">
          <ButtonActionTable
            id={original?.id}
            path={`print-label`}
            hidden={['detail', 'activation']}
          />
          <Button
            onClick={() =>
              handleDeletePrintLabel && handleDeletePrintLabel(original.id)
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
