import { SingleValue } from '@repo/ui/components/modules/RenderDetailValue';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@repo/ui/components/empty-state';
import { useEntityDetail } from '../../hooks/useEntityDetail';
import { generateEntityDetail } from '../../utils/helper';

const EntityDetailInformation: React.FC = () => {
  const { t } = useTranslation(['common', 'entityWMS']);

  const { entity, isLoading } = useEntityDetail();
  const details = generateEntityDetail(t, entity?.data);

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      {isLoading ? (
        <EmptyState withIcon />
      ) : (
        <>
          <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
            <h5 className="ui-font-bold">
              {t('entityWMS:detail.details.title')}
            </h5>
          </div>
          <div className="ui-grid ui-grid-cols-[264px_3px_1fr] ui-gap-x-2 ui-gap-y-4">
            {details?.map(({ label, value, id }) => (
              <SingleValue id={id} key={id} label={label} value={value} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EntityDetailInformation;
