import React from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { DateValue, parseDate } from '@internationalized/date'
import { Button } from '#components/button'
import { ButtonIcon } from '#components/button-icon'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Plus from '#components/icons/Plus'
import { TDetailActivityDate } from '#types/entity'
import dayjs from 'dayjs'
import { Controller, FormProvider, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type TErrorActivity = Record<
  number,
  Record<
    number,
    { start_date?: { message: string }; end_date?: { message: string } }
  >
>

type Props = {
  idx: number
  id: string | number
  fieldObj: TDetailActivityDate[]
}

const EntityActivityImplementationTimeInputDates: React.FC<Props> = ({
  idx,
  id,
  fieldObj,
}) => {
  const { t } = useTranslation(['common', 'entity'])
  const methods = useFormContext()
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = methods

  const handleRemoveDate = (index: number) => {
    const updatedActivities = watch(`activities.${idx}`)
    updatedActivities.splice(index, 1)
    setValue(`activities.${idx}`, updatedActivities)
  }

  const backwardEndDate = (index: number): DateValue | undefined => {
    const prevIndex = index - 1
    const prevEndDate = watch(`activities.${idx}.${prevIndex}.end_date`)
    const prevStartDate = watch(`activities.${idx}.${prevIndex}.start_date`)
    if (prevEndDate) {
      return parseDate(prevEndDate as string)?.add({
        days: 1,
      }) as DateValue
    } else if (prevStartDate) {
      return parseDate(prevStartDate as string)?.add({
        days: 1,
      }) as DateValue
    } else if (prevIndex >= 0) {
      return backwardEndDate(prevIndex)
    } else {
      return undefined
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="ui-flex ui-flex-col ui-flex-1">
        {fieldObj.map((val: TDetailActivityDate, index: number) => (
          <div
            className="ui-flex ui-justify-start ui-items-start ui-gap-4 mb-4"
            key={index?.toString()}
          >
            <div className="ui-w-full">
              <Controller
                control={control}
                name={`activities.${idx}.${index}.start_date`}
                defaultValue={val?.start_date}
                render={({ field: { onChange, value, ...field } }) => (
                  <FormControl>
                    <FormLabel>{t('entity:form.time.label.start')}</FormLabel>
                    <DatePicker
                      {...field}
                      id={`datepicker__activity__join__date__${idx}__${index}`}
                      isDisabled={val?.is_expired || !!val?.entity_activity_id}
                      value={
                        value && value?.split('-')?.length > 2
                          ? parseDate(value)
                          : null
                      }
                      minValue={backwardEndDate(index)}
                      maxValue={
                        (watch(`activities.${idx}.${index}.end_date`)?.split(
                          '-'
                        )?.length ?? 0) > 2
                          ? (parseDate(
                              watch(
                                `activities.${idx}.${index}.end_date`
                              ) as string
                            ) as DateValue)
                          : undefined
                      }
                      onChange={(val) => {
                        const date = val as unknown as Date
                        if (val !== null)
                          onChange(dayjs(date).format('YYYY-MM-DD'))
                        else onChange(null)
                        trigger([
                          `activities.${idx}.${index + 1}.end_date`,
                          `activities.${idx}.${index}.start_date`,
                          `activities.${idx}.${index}.end_date`,
                        ])
                      }}
                      clearable={!val?.is_expired}
                    />
                    {(errors?.activities as TErrorActivity)?.[idx]?.[index]
                      ?.start_date ? (
                      <FormErrorMessage>
                        {
                          (errors?.activities as TErrorActivity)?.[idx]?.[index]
                            ?.start_date?.message as string
                        }
                      </FormErrorMessage>
                    ) : null}
                  </FormControl>
                )}
              />
            </div>
            <div className="ui-w-full">
              <Controller
                control={control}
                name={`activities.${idx}.${index}.end_date`}
                defaultValue={val?.end_date}
                render={({ field: { onChange, value, ...field } }) => (
                  <FormControl>
                    <FormLabel>{t('entity:form.time.label.end')}</FormLabel>
                    <DatePicker
                      {...field}
                      id={`datepicker__activity__end__date__${idx}__${index}`}
                      value={
                        value && value?.split('-')?.length > 2
                          ? parseDate(value)
                          : null
                      }
                      isDisabled={val?.is_expired}
                      minValue={(() => {
                        const startDate = watch(
                          `activities.${idx}.${index}.start_date`
                        )
                        if (
                          val?.entity_activity_id &&
                          !val?.is_expired &&
                          dayjs(startDate) < dayjs().startOf('day')
                        )
                          return parseDate(dayjs().format('YYYY-MM-DD'))

                        if (startDate?.split('-')?.length > 2)
                          return parseDate(startDate as string) as DateValue
                        return undefined
                      })()}
                      maxValue={
                        (watch(
                          `activities.${idx}.${index + 1}.start_date`
                        )?.split('-')?.length ?? 0) > 2
                          ? (parseDate(
                              watch(
                                `activities.${idx}.${index + 1}.start_date`
                              ) as string
                            )?.subtract({
                              days: 1,
                            }) as DateValue)
                          : undefined
                      }
                      onChange={(val) => {
                        const date = val as unknown as Date
                        if (val !== null)
                          onChange(dayjs(date).format('YYYY-MM-DD'))
                        else {
                          onChange(null)
                          if (
                            !watch(
                              `activities.${idx}.${index + 1}.start_date`
                            ) &&
                            !watch(`activities.${idx}.${index + 1}.end_date`)
                          )
                            handleRemoveDate(index + 1)
                        }
                        trigger([
                          `activities.${idx}.${index + 1}.start_date`,
                          `activities.${idx}.${index}.start_date`,
                          `activities.${idx}.${index}.end_date`,
                        ])
                      }}
                      clearable={!val?.is_expired}
                    />
                    {(errors?.activities as TErrorActivity)?.[idx]?.[index]
                      ?.end_date ? (
                      <FormErrorMessage>
                        {
                          (errors?.activities as TErrorActivity)?.[idx]?.[index]
                            ?.end_date?.message as string
                        }
                      </FormErrorMessage>
                    ) : null}
                  </FormControl>
                )}
              />
            </div>
            <div className="ui-w-full">
              {index > 0 && !val?.entity_activity_id && (
                <ButtonIcon
                  type="button"
                  variant="outline"
                  color="danger"
                  onClick={() => handleRemoveDate(index)}
                  className="ui-w-fit ui-mt-6 ui-py-4 ui-px-2 ui-bg-neutral-100 ui-rounded-md ui-border ui-border-red-600 ui-transition-transform ui-duration-200 ui-ease-in-out hover:ui-scale-110"
                >
                  <TrashIcon className="ui-w-5 ui-h-5" />
                </ButtonIcon>
              )}
            </div>
          </div>
        ))}
        {!!watch(`activities.${idx}.${fieldObj.length - 1}.end_date`) && (
          <Button
            type="button"
            variant="outline"
            color="primary"
            onClick={() =>
              setValue(`activities.${idx}`, [
                ...watch(`activities.${idx}`),
                {
                  start_date: null,
                  end_date: null,
                  id: id?.toString(),
                  activity_id: Number(id),
                },
              ])
            }
            className="ui-w-fit"
          >
            <Plus className="ui-w-4 ui-h-4 ui-mr-2" />
            {t('common:add')}
          </Button>
        )}
      </div>
    </FormProvider>
  )
}

export default EntityActivityImplementationTimeInputDates
