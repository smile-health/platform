import { TPartnership } from '@/types/partnership';
import { RenderDetailValue } from '@repo/ui/components/modules/RenderDetailValue';
import { useTranslation } from 'react-i18next';

type ThirdPartyProps = {
  data?: TPartnership;
  isLoading: boolean;
};

const ThirdPartyInfo: React.FC<ThirdPartyProps> = ({ data, isLoading }) => {
  const { t } = useTranslation(['common', 'partnership']);

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold ui-text-dark-blue">
          {t('partnership:detail.third_party_info')}
        </h5>
      </div>
      <RenderDetailValue
        loading={isLoading}
        data={[
          {
            label: t('partnership:list.column_third_party.treatment_company '),
            value: data?.treatmentCompanyName ?? '-',
          },
          {
            label: t('partnership:list.column_third_party.landfill_company'),
            value: data?.landfilCompanyName ?? '-',
          },
          {
            label: t('partnership:list.column_third_party.recycle_company'),
            value: data?.recycleCompanyName ?? '-',
          },
        ]}
      />
    </div>
  );
};

export default ThirdPartyInfo;
