import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import { Input } from '@repo/ui/components/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { TextArea } from '@repo/ui/components/text-area';
import { WasteTypeFormData } from '../../schema/WasteHierarchySchemaForm';

const WasteTypeFormInfo: React.FC = () => {
  const { t } = useTranslation(['wasteHierarchy', 'common']);

  const {
    register,
    formState: { errors },
  } = useFormContext<WasteTypeFormData>();

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <FormControl>
            <FormLabel required>
              {t('wasteHierarchy:form.waste_type.label')}
            </FormLabel>
            <Input
              {...register('waste_type')}
              id="input-waste-source-group"
              type="text"
              placeholder={t('wasteHierarchy:form.waste_type.placeholder')}
              error={!!errors?.waste_type}
            />
            <FormErrorMessage>
              {errors?.waste_type?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel required>
              {t('wasteHierarchy:form.description.label')}
            </FormLabel>
            <TextArea
              {...register('description')}
              id="input-description"
              placeholder={t('wasteHierarchy:form.description.placeholder')}
              error={!!errors?.description}
            />
            <FormErrorMessage>
              {errors?.description?.message as string}
            </FormErrorMessage>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default WasteTypeFormInfo;
