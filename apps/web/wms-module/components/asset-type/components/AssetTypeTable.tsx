import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TAssetType } from '@/types/asset-type';
import { columnsAssetType } from '../constants/table';

type AssetTypeTableProps = CommonType & {
  assetTypeData?: TAssetType[];
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function AssetTypeTable({
  assetTypeData,
  isLoading,
  size = 10,
  page = 1,
}: AssetTypeTableProps) {
  const { t } = useTranslation(['common', 'assetType']);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={assetTypeData}
        columns={columnsAssetType(t, {
          page: page ?? 1,
          size: size ?? 10,
        })}
        isLoading={isLoading}
      />
    </div>
  );
}
