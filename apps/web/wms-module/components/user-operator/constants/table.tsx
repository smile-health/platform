import { TOperatorThirdparty } from '@/types/partnership-operator';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { ButtonActionTableEdit } from '../components/ButtonActionTableEdit';

type DataProps = {
  page: number;
  size: number;
  handleDeleteUserOperator?: (value: TOperatorThirdparty) => void;
};

export const columnsUserOperator = (
  t: TFunction<['common', 'userOperator']>,
  { page, size, handleDeleteUserOperator }: DataProps
): ColumnDef<TOperatorThirdparty>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('userOperator:list.column.username'),
    accessorKey: 'username',
    id: 'username',
    size: 300,
    enableSorting: false,
    cell: ({ row: { original } }) => original.operatorName ?? '-',
  },
  {
    header: t('userOperator:list.column.healthcare_facility_consumer'),
    accessorKey: 'healthcare_facility_consumer',
    id: 'healthcare_facility_consumer',
    size: 300,
    enableSorting: false,
    cell: ({ row: { original } }) => original.consumerName ?? '-',
  },
  {
    header: t('userOperator:list.column.action'),
    accessorKey: 'action',
    id: 'action',
    meta: {
      hidden: loggedAsAdmin(),
    },
    size: 160,
    cell: ({ row: { original } }) => {
      return (
        <div className="flex ">
          <ButtonActionTableEdit data={original} />
          <Button
            onClick={() =>
              handleDeleteUserOperator && handleDeleteUserOperator(original)
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
