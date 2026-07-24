import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type TAnnualPlanningTargetGroupPopUpFormInputAgeProps = {
  title: string
  inputName: string
  triggerInputNames: string[]
}
const AnnualPlanningTargetGroupPopUpFormInputAge = ({
  title,
  inputName,
  triggerInputNames,
}: TAnnualPlanningTargetGroupPopUpFormInputAgeProps) => {
  const { t } = useTranslation(['common', 'annualPlanningTargetGroup'])
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext()
  return (
    <div className="ui-w-full">
      <div className="ui-flex ui-justify-start ui-items-start ui-gap-2 ui-mb-2">
        <h6 className="ui-mb-2 ui-font-normal ui-text-neutral-500">{title}</h6>
        {errors?.[inputName]?.message && (
          <FormErrorMessage>
            {errors?.[inputName]?.message as string}
          </FormErrorMessage>
        )}
      </div>

      <Controller
        control={control}
        name={`${inputName}.year`}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl className="ui-w-full ui-mb-2">
            <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
              <div className="ui-w-2/3">
                <InputNumberV2
                  {...field}
                  value={value || ''}
                  onChange={(val) => {
                    onChange(val)
                    trigger(triggerInputNames)
                  }}
                  id={`input_${inputName}_year`}
                  placeholder="0"
                  className="ui-w-full"
                  allowNegative={false}
                  isPlainFormat={true}
                />
              </div>
              <FormLabel htmlFor={`${inputName}.year`} className="ui-w-1/3">
                {t('annualPlanningTargetGroup:years')}
              </FormLabel>
            </div>
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name={`${inputName}.month`}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl className="ui-w-full ui-mb-2">
            <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
              <div className="ui-w-2/3">
                <InputNumberV2
                  {...field}
                  value={value || ''}
                  onChange={(val) => {
                    onChange(val)
                    trigger(triggerInputNames)
                  }}
                  id={`input_${inputName}_month`}
                  placeholder="0"
                  className="ui-w-full"
                  allowNegative={false}
                  isPlainFormat={true}
                />
              </div>
              <FormLabel htmlFor={`${inputName}.month`} className="ui-w-1/3">
                {t('annualPlanningTargetGroup:months')}
              </FormLabel>
            </div>
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name={`${inputName}.day`}
        render={({
          field: { value, onChange, ...field },
          fieldState: { error },
        }) => (
          <FormControl className="ui-w-full ui-mb-2">
            <div className="ui-flex ui-justify-start ui-items-center ui-gap-2">
              <div className="ui-w-2/3">
                <InputNumberV2
                  {...field}
                  value={value || ''}
                  onChange={(val) => {
                    onChange(val)
                    trigger(triggerInputNames)
                  }}
                  id={`input_${inputName}_day`}
                  placeholder="0"
                  className="ui-w-full"
                  allowNegative={false}
                  isPlainFormat={true}
                />
              </div>
              <FormLabel htmlFor={`${inputName}.day`} className="ui-w-1/3">
                {t('annualPlanningTargetGroup:days')}
              </FormLabel>
            </div>
            {error?.message && (
              <FormErrorMessage>{error?.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />
    </div>
  )
}

export default AnnualPlanningTargetGroupPopUpFormInputAge
