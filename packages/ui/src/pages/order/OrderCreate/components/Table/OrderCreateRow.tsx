import React, { Fragment, useEffect, useMemo } from 'react'
import { Button } from '#components/button'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Td, Tr } from '#components/table'
import { TextArea } from '#components/text-area'
import { numberFormatter } from '#utils/formatter'
import { Controller, FieldError, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { columnsOrderCreateTableHeader } from '../../constants/table'
import { loadReasons } from '../../order-create.service'
import { MappedMaterialData, TOrderCreateForm } from '../../order-create.type'

type OrderCreateRowProps = {
  index: number
  item: MappedMaterialData
  onRemove: (index: number) => void
  onHandleInputChange: (
    value: string | number,
    index: number,
    field: 'ordered_qty' | 'order_reason_id' | 'other_reason'
  ) => void
}

export type OrderItemError = {
  value?: {
    ordered_qty?: FieldError
    order_reason_id?: FieldError
    other_reason?: FieldError
  }
}

export const OrderCreateRow: React.FC<OrderCreateRowProps> = ({
  index,
  item,
  onRemove,
  onHandleInputChange,
}) => {
  const {
    control,
    watch,
    register,
    trigger,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<TOrderCreateForm>()
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderCreate'])

  const activity = watch('activity_id')
  const order_items = watch('order_items')
  const orderedQty = order_items?.[index]?.value?.ordered_qty || 0
  const headers = columnsOrderCreateTableHeader(t)

  const recommendationFormula = useMemo(() => {
    return (
      Math.ceil(
        ((item?.value?.max ?? 0) - (item?.value?.total_qty ?? 0)) /
          (item?.value?.consumption_unit_per_distribution_unit ?? 1)
      ) * (item?.value?.consumption_unit_per_distribution_unit ?? 1)
    )
  }, [item])

  const recommendationQty = useMemo(() => {
    return recommendationFormula > 0 ? recommendationFormula : 0
  }, [recommendationFormula])

  const fieldError = (errors?.order_items as OrderItemError[] | undefined)?.[
    index
  ]?.value

  const showRecommendation = useMemo(() => {
    return (
      (recommendationFormula !== 0 &&
        Number(orderedQty) !== recommendationQty) ||
      (item?.value?.total_qty || 0) >= (item?.value?.max || 0)
    )
  }, [recommendationFormula, orderedQty, recommendationQty, item])

  const watchedOrderedQty = watch(`order_items.${index}.value.ordered_qty`)

  const enableReasons = useMemo(() => {
    return (
      (item?.value?.total_qty || 0) >= (item?.value?.max || 0) ||
      (watchedOrderedQty || 0) !== recommendationQty
    )
  }, [watchedOrderedQty, recommendationQty, item])

  useEffect(() => {
    if (watchedOrderedQty == null) {
      setValue(
        `order_items.${index}.value.ordered_qty`,
        recommendationQty || null
      )
    }
  }, [watchedOrderedQty, recommendationQty, index, setValue])

  useEffect(() => {
    if (!enableReasons) {
      setValue(`order_items.${index}.value.order_reason_id`, null)
    }
  }, [enableReasons, index, setValue])

  useEffect(() => {
    if (recommendationQty) {
      setValue(
        `order_items.${index}.value.recommended_stock`,
        recommendationQty
      )
    } else {
      setValue(`order_items.${index}.value.recommended_stock`, 0)
    }
  }, [recommendationQty, index, setValue])

  return (
    <Tr>
      <Td className="ui-align-top ui-text-sm" id={`cell-${headers?.[0]?.id}`}>
        {index + 1}
      </Td>
      <Td className="ui-align-top ui-text-sm" id={`cell-${headers?.[1]?.id}`}>
        <div
          className="ui-text-dark-blue ui-font-bold"
          id={`cell-${headers?.[1]?.id}-material_name`}
        >
          {item?.label || '-'}
        </div>
        <div id={`cell-${headers?.[1]?.id}-activity`}>
          {t('orderCreate:list.selected.column.material_info.activity', {
            activity: activity?.label || '-',
          })}
        </div>
      </Td>
      <Td className="ui-align-top ui-text-sm" id={`cell-${headers?.[2]?.id}`}>
        <div className="ui-flex ui-flex-col ui-text-dark-blue ui-text-sm">
          <p id={`cell-${headers?.[2]?.id}-on_hand_stock`}>
            {numberFormatter(item?.value?.total_qty || 0, language)}
          </p>
          <p
            className="ui-text-[#737373] ui-text-sm"
            id={`cell-${headers?.[2]?.id}-min_max`}
          >{`(min: ${numberFormatter(item?.value?.min || 0, language)}, max: ${numberFormatter(item?.value?.max || 0, language)})`}</p>
        </div>
      </Td>
      <Td className="ui-align-top" id={`cell-${headers?.[3]?.id}`}>
        <Controller
          control={control}
          name={`order_items.${index}.value.ordered_qty`}
          render={({ field: { value } }) => (
            <FormControl>
              <InputNumberV2
                id={`cell-${headers?.[3]?.id}-${index}-ordered_qty`}
                placeholder={numberFormatter(recommendationQty, language)}
                value={value || undefined}
                onValueChange={(e) => {
                  onHandleInputChange(
                    Number(e.floatValue),
                    index,
                    'ordered_qty'
                  )
                  trigger(`order_items.${index}.value.ordered_qty`)
                }}
                error={!!fieldError?.ordered_qty}
              />
              {fieldError?.ordered_qty && (
                <div id={`cell-${headers?.[3]?.id}-${index}-error`}>
                  {Array.isArray(fieldError?.ordered_qty?.message) ? (
                    <div>
                      {fieldError?.ordered_qty?.message.map((message, i) => (
                        <FormErrorMessage
                          key={
                            (order_items?.[index]?.value?.material_id || 0) + i
                          }
                          id={`error-order_items.${index}.value.material_id`}
                        >
                          {message}
                        </FormErrorMessage>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <FormErrorMessage>
                        {fieldError?.ordered_qty?.message}
                      </FormErrorMessage>
                    </div>
                  )}
                </div>
              )}
            </FormControl>
          )}
        />
        {showRecommendation && (
          <div id={`cell-${headers?.[3]?.id}-${index}-recommendation`}>
            {recommendationQty !== 0 && (
              <div>
                <p
                  className="ui-mt-2 ui- ui-break-words ui-text-[#737373] ui-text-sm"
                  id={`cell-${headers?.[3]?.id}-${index}-recommendation_qty`}
                >
                  {t(
                    'orderCreate:list.selected.column.quantity.recommendation',
                    {
                      value: numberFormatter(recommendationQty, language),
                    }
                  )}
                </p>
                <p
                  className="ui-mt-2 ui-text-[#737373] ui-break-words ui-text-sm"
                  id={`cell-${headers?.[3]?.id}-${index}-recommendation_message`}
                >
                  {t('orderCreate:list.selected.column.quantity.input')}
                </p>
              </div>
            )}
          </div>
        )}
      </Td>
      <Td
        className="ui-align-top"
        id={`cell-${headers?.[4]?.id}-${index}-order_reason`}
      >
        <Controller
          control={control}
          name={`order_items.${index}.value.order_reason_id`}
          render={({ field: { onChange, value, ...field } }) => (
            <Fragment>
              <ReactSelectAsync
                {...field}
                key={`order_items.${index}.value.order_reason_id-${language}-${item?.value?.ordered_qty}`}
                id={`cell-${headers?.[4]?.id}-${index}-order_reason_id`}
                className="!ui-mb-2"
                disabled={!enableReasons}
                placeholder={t(
                  'orderCreate:list.selected.column.reason.placeholder'
                )}
                loadOptions={loadReasons}
                additional={{ page: 1, type: 'request' }}
                debounceTimeout={300}
                onChange={(option: OptionType) => {
                  onHandleInputChange(
                    Number(option?.value),
                    index,
                    'order_reason_id'
                  )
                  onChange(option)
                }}
                value={(value as OptionType) || null}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                error={!!fieldError?.order_reason_id}
              />
              {fieldError?.order_reason_id && (
                <FormErrorMessage>
                  {fieldError.order_reason_id.message}
                </FormErrorMessage>
              )}
            </Fragment>
          )}
        />
        {order_items[index]?.value?.order_reason_id?.value === 9 && (
          <div id={`cell-${headers?.[4]?.id}-${index}-other_reason`}>
            <TextArea
              {...register(`order_items.${index}.value.other_reason`)}
              id={`cell-${headers?.[4]?.id}-${index}-other_reason_input`}
              placeholder={t(
                'orderCreate:list.selected.column.other_reason.placeholder'
              )}
              onBlur={(e) => {
                onHandleInputChange(e.target.value, index, 'other_reason')
                trigger(`order_items.${index}.value.other_reason`)
              }}
              error={!!fieldError?.other_reason}
            />
            {fieldError?.other_reason && (
              <FormErrorMessage>
                {fieldError.other_reason.message}
              </FormErrorMessage>
            )}
          </div>
        )}
      </Td>
      <Td className="ui-align-top">
        <Button
          id={`cell-${headers?.[5]?.id}-${index}-${item?.value?.material_id}-delete`}
          variant="subtle"
          color="danger"
          onClick={() => {
            onRemove(index)
            clearErrors(`order_items.${index}.value.other_reason`)
            clearErrors(`order_items.${index}.value.order_reason_id`)
            clearErrors(`order_items.${index}.value.ordered_qty`)
          }}
        >
          {t('common:delete')}
        </Button>
      </Td>
    </Tr>
  )
}
