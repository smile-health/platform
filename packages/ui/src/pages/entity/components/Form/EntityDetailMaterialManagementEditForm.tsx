import { CheckIcon } from '@heroicons/react/24/outline'
import { Button } from '#components/button'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { InputNumberV2 } from '#components/input-number-v2'
import { OptionType, ReactSelect } from '#components/react-select'
import { Td, Tr } from '#components/table'
import { TEntityMasterMaterial } from '#types/entity'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type Props = {
  setEditData: (value: TEntityMasterMaterial | null) => void
  isLoading: boolean
  createMode?: boolean
  activityOptions?: any
}

const EntityDetailMaterialManagementEditForm: React.FC<Props> = ({
  setEditData,
  isLoading,
  createMode = false,
  activityOptions = [],
}) => {
  const { t } = useTranslation(['user', 'common'])
  const {
    control,
    watch,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext()

  return (
    <Tr>
      <Td>
        {watch('activity_id') && !createMode ? (
          <div className="ui-pt-2">
            <span>{getValues('activity_id')?.label}</span>
          </div>
        ) : (
          <Controller
            name="activity_id"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => (
              <>
                <ReactSelect
                  {...field}
                  id="select__activity"
                  options={activityOptions?.map(
                    (option: { name: string; id: number }) => ({
                      label: option.name,
                      value: option.id,
                    })
                  )}
                  value={value}
                  onChange={(value: OptionType) => {
                    onChange(value)
                  }}
                  placeholder={t('common:select_activity')}
                  menuPosition="fixed"
                />
                {error?.message ? (
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                ) : null}
              </>
            )}
          />
        )}
      </Td>
      <Td>
        <InputNumberV2
          {...register('min', {
            deps: ['max'],
          })}
          id={`min_${getValues('id')}`}
          placeholder="0"
          value={getValues('min')}
          min={0}
          onValueChange={(values) => {
            const { floatValue } = values
            setValue('min', floatValue)
          }}
        />
        {errors?.min ? (
          <FormErrorMessage>{errors.min?.message as string}</FormErrorMessage>
        ) : null}
      </Td>
      <Td>
        <InputNumberV2
          {...register('max', {
            deps: ['min'],
          })}
          id={`max_${getValues('id')}`}
          placeholder="0"
          value={getValues('max')}
          min={getValues('min')}
          onValueChange={(values) => {
            const { floatValue } = values
            setValue('max', floatValue)
          }}
        />
        {errors?.max ? (
          <FormErrorMessage>{errors?.max?.message as string}</FormErrorMessage>
        ) : null}
      </Td>
      <Td>
        <InputNumberV2
          {...register('consumption_rate')}
          id={`consumption_rate_${getValues('id')}`}
          placeholder="0"
          value={getValues('consumption_rate')}
          min={0}
          onValueChange={(values) => {
            const { floatValue } = values
            setValue('consumption_rate', floatValue)
          }}
        />
        {errors?.consumption_rate ? (
          <FormErrorMessage>
            {errors?.consumption_rate?.message as string}
          </FormErrorMessage>
        ) : null}
      </Td>
      <Td>
        <InputNumberV2
          {...register('retailer_price')}
          id={`retailer_price_${getValues('id')}`}
          placeholder="0"
          value={getValues('retailer_price')}
          min={0}
          onValueChange={(values) => {
            const { floatValue } = values
            setValue('retailer_price', floatValue)
          }}
        />
        {errors?.retailer_price ? (
          <FormErrorMessage>
            {errors?.retailer_price?.message as string}
          </FormErrorMessage>
        ) : null}
      </Td>
      <Td>
        <InputNumberV2
          {...register('tax')}
          id={`tax_${getValues('id')}`}
          placeholder="0"
          value={getValues('tax')}
          min={0}
          onValueChange={(values) => {
            const { floatValue } = values
            setValue('tax', floatValue)
          }}
        />
        {errors?.tax ? (
          <FormErrorMessage>{errors?.tax?.message as string}</FormErrorMessage>
        ) : null}
      </Td>
      {!createMode ? (
        <Td>
          <div className="ui-flex ui-justify-start ui-items-center ui-mt-2">
            <Button
              id={`save_${getValues('id')}`}
              variant="light"
              className="ui-bg-transparent ui-p-0 ui-h-auto ui-mr-[18px]  hover:!ui-bg-transparent"
              type="submit"
              loading={isLoading}
            >
              <div className="ui-flex ui-justify-center ui-items-center !ui-text-[#004990]">
                <div className="ui-mr-[8px]">
                  <CheckIcon className="h-4 w-4" />
                </div>
                {t('common:save')}
              </div>
            </Button>
            <Button
              id={`cancel_${getValues('id')}`}
              variant="light"
              color="danger"
              className="ui-bg-transparent ui-p-0 ui-h-auto hover:!ui-bg-transparent"
              type="button"
              onClick={() => setEditData(null)}
            >
              <div className="ui-ml-[4.16px] ui-rotate-45 ui-mt-1">
                <Plus />
              </div>
            </Button>
          </div>
        </Td>
      ) : null}
    </Tr>
  )
}

export default EntityDetailMaterialManagementEditForm
