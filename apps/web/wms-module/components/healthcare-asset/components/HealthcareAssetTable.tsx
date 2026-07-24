import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { columnsHealthcareAsset } from '../constants/table';
import { useHealthcareAssetTable } from '../hooks/useHealthcareAssetTable';

type HealthcareAssetTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function HealthcareAssetTable({
  isLoading,
  size = 10,
  page = 1,
}: HealthcareAssetTableProps) {
  const { t: tHealthCare } = useTranslation('healthcareAsset');

  const { healthcareAssetDataSource } = useHealthcareAssetTable();

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={healthcareAssetDataSource?.data}
        columns={columnsHealthcareAsset(tHealthCare, {
          page: page ?? 1,
          size: size ?? 10,
        })}
        isLoading={isLoading}
      />
    </div>
  );
}
