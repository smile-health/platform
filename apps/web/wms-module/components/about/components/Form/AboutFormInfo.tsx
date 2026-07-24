import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@repo/ui/components/form-control';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isThirdPartyEntity } from '@/utils/getUserRole';
import { Input } from '@repo/ui/components/input';
import { Radio, RadioGroup } from '@repo/ui/components/radio';
import { AboutFormData } from '../../schema/AboutSchemaForm';

const AboutFormInfo: React.FC = () => {
  const { t } = useTranslation(['about', 'common']);

  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
  } = useFormContext<AboutFormData>();

  const gender = useWatch({ name: 'gender' });

  return (
    <div className="ui-flex ui-flex-col">
      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-flex ui-flex-col ui-space-y-5">
          {isThirdPartyEntity() && (
            <FormControl>
              <FormLabel>{t('about:form.nib.label')}</FormLabel>
              <Input
                {...register('nib')}
                id="input-nib"
                type="text"
                placeholder={t('about:form.nib.placeholder')}
                error={!!errors?.nib}
              />
              <FormErrorMessage>
                {errors?.nib?.message as string}
              </FormErrorMessage>
            </FormControl>
          )}
          <FormControl>
            <FormLabel>{t('about:form.head_name.label')}</FormLabel>
            <Input
              {...register('headName')}
              id="input-head-name"
              type="text"
              placeholder={t('about:form.head_name.placeholder')}
              error={!!errors?.headName}
            />
            <FormErrorMessage>
              {errors?.headName?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel required>{t('about:form.gender.label')}</FormLabel>
            <RadioGroup className="ui-py-2">
              <Radio
                {...register('gender', {
                  onChange: (e) => {
                    setValue('gender', e.target.value);
                    clearErrors('gender');
                  },
                })}
                id="gender-male"
                value={1}
                checked={Number(gender) === 1}
                label={t('common:gender.male')}
              />
              <Radio
                {...register('gender', {
                  onChange: (e) => {
                    setValue('gender', e.target.value);
                    clearErrors('gender');
                  },
                })}
                id="gender-female"
                value={0}
                checked={Number(gender) === 0}
                label={t('common:gender.female')}
              />
            </RadioGroup>
          </FormControl>
          <FormControl>
            <FormLabel>{t('about:form.email.label')}</FormLabel>
            <Input
              {...register('email')}
              id="input-email"
              type="email"
              placeholder={t('about:form.email.placeholder')}
              error={!!errors?.email}
            />
            <FormErrorMessage>
              {errors?.email?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>{t('about:form.phone.label')}</FormLabel>
            <Input
              {...register('phone')}
              id="input-phone"
              type="number"
              placeholder={t('about:form.phone.placeholder')}
              error={!!errors?.phone}
              className="[&::-webkit-outer-spin-button]:ui-appearance-none [&::-webkit-inner-spin-button]:ui-appearance-none"
            />
            <FormErrorMessage>
              {errors?.phone?.message as string}
            </FormErrorMessage>
          </FormControl>
          {!isThirdPartyEntity() && (
            <>
              <FormControl>
                <FormLabel>{t('about:form.total_bad_room.label')}</FormLabel>
                <Input
                  {...register('totalBedroom')}
                  id="input-room-count"
                  type="number"
                  min={0}
                  placeholder={t('about:form.total_bad_room.placeholder')}
                  error={!!errors?.totalBedroom}
                  className="[&::-webkit-outer-spin-button]:ui-appearance-none [&::-webkit-inner-spin-button]:ui-appearance-none"
                />
                <FormErrorMessage>
                  {errors?.totalBedroom?.message as string}
                </FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>
                  {t('about:form.percentage_bad_room.label')}
                </FormLabel>
                <Input
                  {...register('percentageBedroom')}
                  id="input-room-usage-percentage"
                  type="text"
                  inputMode="decimal"
                  placeholder={t('about:form.percentage_bad_room.placeholder')}
                  error={!!errors?.percentageBedroom}
                  onChange={(e) => {
                    const value = e.target.value.replace(',', '.');
                    e.target.value = value;
                  }}
                  className="[&::-webkit-outer-spin-button]:ui-appearance-none [&::-webkit-inner-spin-button]:ui-appearance-none"
                />
                <FormErrorMessage>
                  {errors?.percentageBedroom?.message as string}
                </FormErrorMessage>
              </FormControl>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutFormInfo;
