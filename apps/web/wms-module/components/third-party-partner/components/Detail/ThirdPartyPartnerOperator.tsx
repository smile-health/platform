import { TPartnershipOperator } from '@/types/partnership-operator';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';
import { columnsOperatorTable } from '../../constants/operatorTable';

type PartnerOperatorProps = {
  data?: TPartnershipOperator[];

  isLoading: boolean;
};

const ThirdPartyPartnerOperator: React.FC<PartnerOperatorProps> = ({
  data,
  isLoading,
}) => {
  const { t } = useTranslation(['common', 'thirdPartyPartner']);

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold ui-text-dark-blue">
          {t('thirdPartyPartner:detail.operator_info')}
        </h5>
      </div>
      <DataTable
        data={data}
        columns={columnsOperatorTable(t)}
        isLoading={isLoading}
        className="ui-overflow-x-auto"
        emptyDescription="No registered users available"
      />
    </div>
  );
};

export default ThirdPartyPartnerOperator;
