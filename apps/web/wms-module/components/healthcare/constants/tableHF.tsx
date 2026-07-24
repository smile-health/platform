import { ButtonActionTable } from '@/components/ButtonActionTable';
import { THealthcare } from '@/types/healthcare';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

import { loggedAsAdmin } from '@/utils/getUserRole';
import dayjs from 'dayjs';
import { getAssetStatusOptions, getAssetTypeOptions } from '../utils/helper';

type DataProps = {
  page: number;
  size: number;
  handleDeleteHealthcare?: (id: number) => void;
};

export const columnsHealthcareHF = (
  tCommon: TFunction<'common'>,
  tHealthCare: TFunction<'healthCare'>,
  { page, size, handleDeleteHealthcare }: DataProps
): ColumnDef<THealthcare>[] => {
  const options = getAssetStatusOptions(tHealthCare);
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 50,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: tHealthCare('list.column.asset_type'),
      accessorKey: 'asset_type',
      id: 'asset_type',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        const assetType = original.assetModel?.assetType;
        if (!assetType) return '-';
        const typeOption = getAssetTypeOptions(tCommon).find(
          (opt) => opt.value === assetType
        );
        return typeOption?.label ?? assetType;
      },
    },
    {
      header: tHealthCare('list.column.manufacture'),
      accessorKey: 'manufacture',
      id: 'manufacture',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.assetModel?.manufacturer?.name ?? '-',
    },
    {
      header: tHealthCare('list.column.model'),
      accessorKey: 'model',
      id: 'model',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.assetModel?.name ?? '-',
    },
    {
      header: tHealthCare('list.column.last_maintenance'),
      accessorKey: 'last_maintenance',
      id: 'last_maintenance',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.dateMaintenanceActivity
          ? dayjs(original.dateMaintenanceActivity).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: tHealthCare('list.column.last_calibration'),
      accessorKey: 'last_calibration',
      id: 'last_calibration',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) =>
        original.dateCalibrationActivity
          ? dayjs(original.dateCalibrationActivity).format('DD/MM/YYYY')
          : '-',
    },
    {
      header: tHealthCare('list.column.asset_id'),
      accessorKey: 'asset_id',
      id: 'asset_id',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original.assetId ?? '-',
    },
    {
      header: tHealthCare('list.column.sync_status'),
      accessorKey: 'sync_status',
      id: 'sync_status',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        return (
          <Badge
            rounded="full"
            color={original.isIotEnable ? 'success' : 'danger'}
            variant="light"
          >
            {original.isIotEnable ? 'Enabled' : 'Disabled'}
          </Badge>
        );
      },
    },
    {
      header: tHealthCare('list.column.asset_status'),
      accessorKey: 'asset_status',
      id: 'asset_status',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        const status = options.find((s) => s.value === original.assetStatus);
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
      header: tHealthCare('list.column.action'),
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
              path={`healthcare`}
              hidden={['activation']}
            />
            <Button
              onClick={() =>
                handleDeleteHealthcare && handleDeleteHealthcare(original.id)
              }
              type="button"
              variant="subtle"
              className="!ui-px-1.5 ui-text-danger-500"
            >
              {tCommon('remove')}
            </Button>
          </div>
        );
      },
    },
  ];
};
