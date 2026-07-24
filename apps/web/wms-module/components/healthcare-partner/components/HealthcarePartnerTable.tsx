import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { columnsHealthcarePartner } from '../constants/table';
import { useHealthcarePartnerTable } from '../hooks/useHealthcarePartnerTable';

type HealthcarePartnerTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function HealthcarePartnerTable({
  isLoading,
  size = 10,
  page = 1,
}: HealthcarePartnerTableProps) {
  const { t } = useTranslation(['common', 'healthcarePartner']);

  const { partnershipDataSource } = useHealthcarePartnerTable();

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={partnershipDataSource?.data?.data}
        columns={columnsHealthcarePartner(t, {
          page: page ?? 1,
          size: size ?? 10,
        })}
        isLoading={isLoading}
      />
    </div>
  );
}
