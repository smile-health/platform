import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { useTranslation } from 'react-i18next';

import EntityFormInformation from './Form/EntityFormInformation';

const EntityForm: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <form
      onSubmit={() => {}}
      className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
    >
      <EntityFormInformation />

      <div className="ui-flex ui-justify-end">
        <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
          <Button
            id="btn-back-entity"
            type="button"
            variant="outline"
            onClick={() => router.back()}
            loading={false}
          >
            {t('back')}
          </Button>
          <Button
            id="btn-submit-entity"
            type="submit"
            loading={false}
            disabled={false}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EntityForm;
