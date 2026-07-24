import { ButtonActionTable } from '@/components/ButtonActionTable';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { Badge } from '@repo/ui/components/badge';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import { THealthcareAsset, WorkingStatusEnum } from '@/types/healthcare-asset';
import { getWorkingStatus } from './assetHealthcare';
import { useContext } from 'react';
import { HealthcareAssetListContext } from '../utils/healthcare-asset-list.context';
import { useParams } from 'next/navigation';

type DataProps = {
  page: number;
  size: number;
};

export const columnsHealthcareAsset = (
  tHealthCare: TFunction<'healthcareAsset'>,
  { page, size }: DataProps
): ColumnDef<THealthcareAsset>[] => {
  return [
    {
      header: 'No.',
      accessorKey: 'no',
      id: 'no',
      size: 50,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: tHealthCare('list.column.serial_number'),
      accessorKey: 'serial_number',
      id: 'serial_number',
      size: 300,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        const assetModelName = original.asset_model?.name ?? '';
        const manufactureName = original.manufacture?.name ?? '';
        return `${original.serial_number} - ${assetModelName} - ${manufactureName}`;
      },
    },
    {
      header: tHealthCare('list.column.asset_type'),
      accessorKey: 'asset_type',
      id: 'asset_type',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original?.asset_type?.name ?? '-',
    },
    {
      header: tHealthCare('list.column.asset_status'),
      accessorKey: 'asset_status',
      id: 'asset_status',
      size: 200,
      enableSorting: false,
      cell: ({ row: { original } }) => original?.status?.name ?? '-',
    },
    {
      header: tHealthCare('list.column.working_status'),
      accessorKey: 'working_status',
      id: 'working_status',
      size: 200,
      enableSorting: false,
      cell: function WorkingStatusCell({
        row: {
          original: { working_status },
        },
      }) {
        return (
          <Badge
            key={working_status?.id}
            variant="light"
            rounded="xl"
            color={
              getWorkingStatus(tHealthCare)[
                working_status?.id as WorkingStatusEnum
              ]?.color
            }
          >
            {working_status?.name}
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
      cell: function ActionCell({
        row: { original },
      }: {
        row: { original: THealthcareAsset };
      }) {
        const { isAdmin } = useContext(HealthcareAssetListContext);
        const {id} = useParams()
        const pathLink = isAdmin ? `asset-dongle/${id}`: 'healthcare-asset'
        return (
          <div className="ui-flex ui-gap-0.5">
            <ButtonActionTable
              id={original?.id}
              path={pathLink}
              hidden={['activation', 'edit']}
            />
          </div>
        );
      },
    },
  ];
};
