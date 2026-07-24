import {
  GetClassificationPartnershipResponse,
  ProviderType,
  TPartnership,
} from '@/types/partnership';
import { GetPartnershipOperatorResponse } from '@/types/partnership-operator';
import { GetPartnershipVehicleResponse } from '@/types/partnership-vehicle';
import ClassificationPartnership from './Detail/ClassificationPartnership';
import PartnerOperator from './Detail/PartnerOperator';
import PartnershipInfo from './Detail/PartnershipInfo';
import PartnerVehicle from './Detail/PartnerVehicle';
import ThirdPartyInfo from './Detail/ThirdPartyInfo';

type SectionPagination<T> = {
  data?: T;
  isLoading: boolean;
  page: number;
  paginate: number;
  handleChangePage: (page: number) => void;
  handleChangePaginate: (paginate: number) => void;
};

type PartnershipDetailProps = {
  data?: TPartnership;
  vehicleData?: GetPartnershipVehicleResponse;
  classification: SectionPagination<GetClassificationPartnershipResponse>;
  operator: SectionPagination<GetPartnershipOperatorResponse>;
  isLoading: boolean;
  page: number;
  paginate: number;
  handleChangePage: (page: number) => void;
  handleChangePaginate: (paginate: number) => void;
};

const PartnershipDetail: React.FC<PartnershipDetailProps> = ({
  data,
  vehicleData,
  classification,
  operator,
  isLoading,
  page,
  paginate,
  handleChangePage,
  handleChangePaginate,
}) => {
  return (
    <div className="space-y-4">
      <PartnershipInfo data={data} isLoading={isLoading} />
      <ClassificationPartnership {...classification} />
      {data?.providerType === ProviderType.TRANSPORTER && !isLoading && (
        <ThirdPartyInfo data={data} isLoading={isLoading} />
      )}
      <PartnerOperator {...operator} />
      <PartnerVehicle
        data={vehicleData}
        page={page}
        paginate={paginate}
        handleChangePage={handleChangePage}
        handleChangePaginate={handleChangePaginate}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PartnershipDetail;
