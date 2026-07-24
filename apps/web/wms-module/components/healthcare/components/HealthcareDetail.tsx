import { THealthcare } from '@/types/healthcare';
import { isFacilityAdmin } from '@/utils/getUserRole';
import CalibrationInfo from './Detail/CalibrationInfo';
import HealthcareInfo from './Detail/HealthcareInfo';
import MaintenanceInfo from './Detail/MaintenanceInfo';

type HealthcareDetailProps = {
  data?: THealthcare;
  isLoading: boolean;
};

const HealthcareDetail: React.FC<HealthcareDetailProps> = ({
  data,
  isLoading,
}) => {
  return (
    <div className="space-y-4">
      <HealthcareInfo data={data} isLoading={isLoading} />
      {isFacilityAdmin() && (
        <>
          <MaintenanceInfo />
          <CalibrationInfo />
        </>
      )}
    </div>
  );
};

export default HealthcareDetail;
