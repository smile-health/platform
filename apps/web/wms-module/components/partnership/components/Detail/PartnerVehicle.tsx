import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@repo/ui/components/data-table';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import { columnsVehicleTable } from '../../constants/vehicleTable';
import { GetPartnershipVehicleResponse } from '@/types/partnership-vehicle';

type PartnerVehicleProps = {
  data?: GetPartnershipVehicleResponse;
  isLoading: boolean;
  page: number;
  paginate: number;
  handleChangePage: (page: number) => void;
  handleChangePaginate: (paginate: number) => void;
};

const PartnerVehicle: React.FC<PartnerVehicleProps> = ({
  data,
  isLoading,
  page,
  paginate,
  handleChangePage,
  handleChangePaginate,
}) => {
  const { t } = useTranslation(['common', 'partnership']);

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold ui-text-dark-blue">
          {t('partnership:detail.vehicle_info')}
        </h5>
      </div>
      <DataTable
        data={data?.data?.data ?? []}
        columns={columnsVehicleTable(t)}
        isLoading={isLoading}
        className="ui-overflow-x-auto"
        emptyDescription="No registered vehicle available"
      />

      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={handleChangePaginate}
        />
        <PaginationInfo
          total={data?.data?.pagination?.total ?? 0}
          currentPage={page}
          size={paginate}
        />
        <Pagination
          totalPages={data?.data?.pagination?.pages ?? 0}
          currentPage={page}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
    </div>
  );
};

export default PartnerVehicle;
