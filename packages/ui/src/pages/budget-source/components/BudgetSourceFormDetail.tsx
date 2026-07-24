import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { Radio, RadioGroup } from '#components/radio'
import { TextArea } from '#components/text-area'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CreateBudgetSourceBody } from '../budget-source.type'

const BudgetSourceFormDetail = () => {
  const { t } = useTranslation('budgetSource')
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<CreateBudgetSourceBody>()
  const { is_restricted } = watch()
  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('form.title.detail')}
      </div>
      <div className="ui-flex ui-flex-col ui-space-y-5">
        <FormControl>
          <FormLabel required>{t('form.detail.label.name')}</FormLabel>
          <Input
            {...register('name')}
            id="input-budget-source-name"
            placeholder={t('form.detail.placeholder.name')}
          />
          {errors?.name?.message && (
            <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel>{t('form.detail.label.description')}</FormLabel>
          <TextArea
            {...register('description')}
            id="input-budget-source-description"
            placeholder={t('form.detail.placeholder.description')}
          />
          {errors?.description?.message && (
            <FormErrorMessage>{errors?.description?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel>{t('form.detail.label.restricted_usage')}?</FormLabel>
          <RadioGroup>
            <Radio
              {...register('is_restricted')}
              id="restricted-usage-yes"
              value={1}
              checked={Number(is_restricted) === 1}
              label={t('yes')}
            />
            <Radio
              {...register('is_restricted')}
              id="restricted-usage-no"
              value={0}
              checked={Number(is_restricted) === 0}
              label={t('no')}
            />
          </RadioGroup>
          <FormLabel>{t('form.detail.placeholder.restricted_usage')}</FormLabel>
        </FormControl>
      </div>
    </div>
  )
}

export default BudgetSourceFormDetail
