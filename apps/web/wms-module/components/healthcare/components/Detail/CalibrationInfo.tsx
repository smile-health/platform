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
import { columnsCalibration } from '../../constants/calibrationTable';
import { useCalibrationTable } from '../../hooks/useCalibrationTable';

type CalibrationInfoProps = {};

const CalibrationInfo: React.FC<CalibrationInfoProps> = ({}) => {
  const { t, i18n } = useTranslation(['common', 'healthCare']);
  const language = i18n.language;

  const router = useRouter();
  const { id } = useParams();
  const {
    handleChangePage,
    handleChangePaginate,
    pagination,
    calibrationDataSource,
    isLoading,
  } = useCalibrationTable();

  const handleAddClick = () => {
    router.push(
      `/${language}/healthcare/${id}/create?activity=${ActivityType.CALIBRATION}`
    );
  };

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-mt-1 ui-justify-between ui-items-center ui-gap-4">
        <h5 className="ui-font-bold ui-text-dark-blue">
          {t('healthCare:detail.calibration_act')}
        </h5>
        <Button
          id="btn-add"
          type="button"
          variant="outline"
          onClick={handleAddClick}
        >
          {t('healthCare:button.add_calibration')}
        </Button>
      </div>
      <DataTable
        data={calibrationDataSource?.data.data}
        columns={columnsCalibration(t, {
          page: pagination.pageCalibration,
          size: pagination.paginateCalibration,
        })}
        isLoading={isLoading}
        className="ui-overflow-x-auto"
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={pagination.paginateCalibration}
          onChange={handleChangePaginate}
          perPagesOptions={calibrationDataSource?.list_pagination}
        />
        <PaginationInfo
          size={pagination.paginateCalibration}
          currentPage={pagination.pageCalibration}
          total={calibrationDataSource?.data?.pagination?.total}
        />
        <Pagination
          totalPages={calibrationDataSource?.data?.pagination?.pages ?? 0}
          currentPage={pagination.pageCalibration}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
    </div>
  );
};

export default CalibrationInfo;
