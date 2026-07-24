import { TPartnership } from '@/types/partnership';
import { TPartnershipOperator } from '@/types/partnership-operator';
import { useTranslation } from 'react-i18next';
import ThirdPartyPartnerInfo from './Detail/ThirdPartyPartnerInfo';
import ThirdPartyPartnerOperator from './Detail/ThirdPartyPartnerOperator';

type ThirdPartyPartnerDetailProps = {
  data?: TPartnership;
  operatorData?: TPartnershipOperator[];
  isLoading?: boolean;
};

const ThirdPartyPartnerDetail: React.FC<ThirdPartyPartnerDetailProps> = ({
  data,
  operatorData,
  isLoading = false,
}) => {
  const { t } = useTranslation(['common', 'thirdPartyPartner']);
  return (
    <div className="space-y-4">
      <ThirdPartyPartnerInfo data={data} isLoading={isLoading} />
      <ThirdPartyPartnerOperator data={operatorData} isLoading={isLoading} />
    </div>
  );
};

export default ThirdPartyPartnerDetail;
