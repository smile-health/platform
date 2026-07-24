import { FormControl, FormLabel } from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import { InputPhone } from '@repo/ui/components/input-phone';
import { Radio } from '@repo/ui/components/radio';
import { useTranslation } from 'react-i18next';

import { USER_GENDER } from '@/components/user/user.constants';

const EntityFormInformation: React.FC = () => {
  const { t } = useTranslation(['entityWMS', 'common']);

  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
        <FormControl>
          <FormLabel>
            {t('entityWMS:form.information.label.head_name')}
          </FormLabel>
          <Input
            id="input-head-name"
            placeholder={t('entityWMS:form.information.placeholder.head_name')}
          />
        </FormControl>
        <FormControl>
          <FormLabel required>{t('entityWMS:form.gender.label')}</FormLabel>
          <div className="ui-flex ui-items-center ui-gap-4">
            <Radio
              data-testid="radio-male"
              label={t('entityWMS:form.gender.male')}
              value={USER_GENDER.MALE}
            />
            <Radio
              data-testid="radio-female"
              label={t('entityWMS:form.gender.female')}
              value={USER_GENDER.FEMALE}
            />
          </div>
        </FormControl>
        <FormControl>
          <FormLabel>{t('entityWMS:form.information.label.email')}</FormLabel>
          <Input
            id="input-email"
            placeholder={t('entityWMS:form.information.placeholder.email')}
            type="email"
          />
        </FormControl>
        <FormControl>
          <FormLabel>{t('entityWMS:form.phone.label')}</FormLabel>
          <InputPhone
            id="input-phone"
            data-testid="input-phone"
            onChange={() => {}}
            placeholder={t('entityWMS:form.phone.placeholder')}
          />
        </FormControl>
      </div>
    </div>
  );
};

export default EntityFormInformation;
