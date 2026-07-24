import { ButtonActionTable } from '@/components/ButtonActionTable';
import { SourceType, TWasteSource } from '@/types/waste-source';
import { isSanitarian, loggedAsAdmin } from '@/utils/getUserRole';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import {
  getInternalTreatmentOptions,
  getSourceTypeOptions,
} from '../utils/helper';

type DataProps = {
  page: number;
  size: number;
  handleDeleteWasteSource?: (id: number) => void;
};

export const columnsWasteSource = (
  t: TFunction<['common', 'wasteSource']>,
  { page, size, handleDeleteWasteSource }: DataProps
): ColumnDef<TWasteSource>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('wasteSource:list.column.source_type'),
    accessorKey: 'source_type',
    id: 'source_type',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      const options = getSourceTypeOptions();
      const source = options.find((s) => s.value === original.sourceType);
      return <span>{source?.label ?? '-'}</span>;
    },
  },
  {
    header: t('wasteSource:list.column.waste_source'),
    accessorKey: 'waste_source',
    id: 'waste_source',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => {
      const {
        sourceType,
        internalSourceName,
        externalHealthcareFacilityName,
        internalTreatmentName,
      } = original;

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
    header: t('wasteSource:list.column.updated_by'),
    accessorKey: 'updated_by',
    id: 'updated_by',
    size: 200,
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
    header: t('wasteSource:list.column.action'),
    accessorKey: 'action',
    id: 'action',
    meta: {
      hidden: loggedAsAdmin() || isSanitarian(),
    },
    size: 160,
    cell: ({ row: { original } }) => {
      return (
        <div className="ui-flex ui-gap-0.5">
          {original.sourceType !== SourceType.INTERNAL_TREATMENT && (
            <ButtonActionTable
              id={original?.id}
              path={`waste-source`}
              hidden={['detail', 'activation']}
            />
          )}
          <Button
            onClick={() =>
              handleDeleteWasteSource && handleDeleteWasteSource(original.id)
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
