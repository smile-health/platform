import { loggedAsAdmin } from '@/utils/getUserRole';
import { Button } from '@repo/ui/components/button';
import { DataTable } from '@repo/ui/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { getProviderTypeOptions } from '../utils/helper';
import { TFunction } from 'i18next';

interface WasteSpecificationTableProps {
  data: any[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

function createWasteSpecificationColumns(
  t: TFunction<['thirdPartyPartner', 'common']>,
  onEdit: (index: number) => void,
  onRemove: (index: number) => void,
  loggedAsAdminFlag: boolean
): ColumnDef<any>[] {
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 20,
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t('thirdPartyPartner:form.waste_characteristic.label'),
      accessorKey: 'waste_characteristic',
      id: 'waste_characteristic',
      size: 170,
      cell: ({ row: { original } }) => original.characteristicLabel ?? '-',
    },
    {
      header: t('thirdPartyPartner:list.column.partnership_type'),
      accessorKey: 'partnership_type',
      id: 'partnership_type',
      size: 120,
      cell: ({ row: { original } }) =>
        getProviderTypeOptions().find(
          (option) => option.value === original.providerType
        )?.label ?? '-',
    },
    {
      header: t('common:action'),
      accessorKey: 'action',
      id: 'action',
      meta: {
        hidden: loggedAsAdminFlag,
      },
      size: 60,
      cell: ({ row: { index } }) => (
        <div className="ui-flex ui-gap-1">
          <Button
            onClick={() => onEdit(index)}
            type="button"
            variant="subtle"
            className="!ui-px-2"
            size="sm"
          >
            {t('common:edit')}
          </Button>
          <Button
            onClick={() => onRemove(index)}
            type="button"
            variant="subtle"
            className="!ui-px-2 ui-text-danger-500"
            size="sm"
          >
            {t('common:remove')}
          </Button>
        </div>
      ),
    },
  ];
}

export const WasteSpecificationTable = ({
  data,
  onEdit,
  onRemove,
}: WasteSpecificationTableProps) => {
  const { t } = useTranslation(['thirdPartyPartner', 'common']);

  const columns = createWasteSpecificationColumns(
    t,
    onEdit,
    onRemove,
    loggedAsAdmin()
  );

  return <DataTable data={data} columns={columns} />;
};
