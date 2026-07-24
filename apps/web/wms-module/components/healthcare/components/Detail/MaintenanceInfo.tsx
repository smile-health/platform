import { ActivityType } from '@/types/hf-asset-activity';
import { Button } from '@repo/ui/components/button';
import { DataTable } from '@repo/ui/components/data-table';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { columnsMaintenance } from '../../constants/maintenanceTable';
import { useMaintenanceTable } from '../../hooks/useMaintenanceTable';

type MaintenanceInfoProps = {};

const MaintenanceInfo: React.FC<MaintenanceInfoProps> = ({}) => {
  const { t, i18n } = useTranslation(['common', 'healthCare']);
  const language = i18n.language;
  const router = useRouter();
  const { id } = useParams();

  const {
    handleChangePage,
    handleChangePaginate,
    pagination,
    maintenanceDataSource,
    isLoading,
  } = useMaintenanceTable();

  const handleAddClick = () => {
    router.push(
      `/${language}/healthcare/${id}/create?activity=${ActivityType.MAINTENANCE}`
    );
  };

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-mt-1 ui-justify-between ui-items-center ui-gap-4">
        <h5 className="ui-font-bold ui-text-dark-blue">
          {t('healthCare:detail.maintenance_act')}
        </h5>
        <Button
          id="btn-add"
          type="button"
          variant="outline"
          onClick={handleAddClick}
        >
          {t('healthCare:button.add_maintenance')}
        </Button>
      </div>
      <DataTable
        data={maintenanceDataSource?.data.data}
        columns={columnsMaintenance(t, {
          page: pagination.pageMaintenance,
          size: pagination.paginateMaintenance,
        })}
        isLoading={isLoading}
        className="ui-overflow-x-auto"
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={pagination.paginateMaintenance}
          onChange={handleChangePaginate}
          perPagesOptions={maintenanceDataSource?.list_pagination}
        />
        <PaginationInfo
          size={pagination.paginateMaintenance}
          currentPage={pagination.pageMaintenance}
          total={maintenanceDataSource?.data?.pagination?.total}
        />
        <Pagination
          totalPages={maintenanceDataSource?.data?.pagination?.pages ?? 0}
          currentPage={pagination.pageMaintenance}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
    </div>
  );
};

export default MaintenanceInfo;
