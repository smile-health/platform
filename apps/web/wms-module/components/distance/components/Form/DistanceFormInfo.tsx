import { Button } from '@repo/ui/components/button';
import Pencil from '@repo/ui/components/icons/Pencil';
import XMark from '@repo/ui/components/icons/XMark';
import { Input } from '@repo/ui/components/input';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { TEntitySettings } from '@/types/entity-settings';
import {
  FormControl,
  FormErrorMessage,
} from '@repo/ui/components/form-control';
import { DistanceSchemaFormData } from '../../schema/DistanceSchemaForm';
import { isFacilityAdmin, isSuperAdmin } from '@/utils/getUserRole';

interface DistanceFormInfoProps {
  entitySettings?: TEntitySettings;
  isFound: boolean;
  isLoading: boolean;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
}

const DistanceFormInfo: React.FC<DistanceFormInfoProps> = ({
  entitySettings,
  isFound,
  isLoading,
  isEditMode,
  setIsEditMode,
}) => {
  const { t } = useTranslation(['distance', 'common']);

  const {
    register,
    formState: { errors },
    reset,
  } = useFormContext<DistanceSchemaFormData>();

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-flex ui-flex-row ui-gap-10 ui-items-center">
        <div className="ui-w-1/5" style={{ marginTop: '-4vh' }}>
          <p className="ui-w-fit ui-text-gray-400">
            {t('distance:form.distance.label')}
          </p>
        </div>
        <span style={{ marginTop: '-4vh' }}>:</span>

        <div
          className="ui-flex ui-flex-col ui-gap-3"
          style={{ marginTop: '5vh', maxWidth: '35vw' }}
        >
          {isEditMode ? (
            <div className="ui-flex ui-flex-row ui-gap-4 ui-items-center">
              <FormControl>
                <Input
                  {...register('distance_limit')}
                  id="input-distance-limit"
                  type="number"
                  placeholder={t('distance:form.distance.placeholder')}
                  error={!!errors?.distance_limit}
                />
                <FormErrorMessage>
                  {errors?.distance_limit?.message as string}
                </FormErrorMessage>
              </FormControl>

              <Button
                id="save-distance-limit"
                variant="subtle"
                color="primary"
                type="submit"
                loading={isLoading}
              >
                Save
              </Button>
              <Button
                variant="subtle"
                onClick={() => {
                  setIsEditMode(false);
                  reset({
                    distance_limit: Number(entitySettings?.settingValue),
                  });
                }}
                type="button"
                id="cancel-edit-distance-limit"
              >
                <XMark />
              </Button>
            </div>
          ) : (
            <div className="ui-flex ui-flex-row ui-gap-4 ui-items-center">
              <p>{isFound ? entitySettings?.settingValue : '0'} </p>
              {(isFacilityAdmin() || isSuperAdmin()) && (
                <Pencil
                  onClick={() => setIsEditMode(true)}
                  className="hover:ui-cursor-pointer ui-text-blue-800 ui-w-4 ui-h-4"
                />
              )}
            </div>
          )}
          <div className="ui-text-sm ui-leading-none ui-text-gray-500 ui-mb-10">
            {t('distance:form.distance.helper_text')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistanceFormInfo;
