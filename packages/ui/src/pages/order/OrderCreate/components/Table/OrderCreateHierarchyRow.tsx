import React, { Fragment, useContext } from 'react'
import { Button } from '#components/button'
import { Exists } from '#components/exists'
import { FormControl, FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { InputNumberV2 } from '#components/input-number-v2'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Td, Tr } from '#components/table'
import { TextArea } from '#components/text-area'
import { getBackgroundStock, numberFormatter } from '#utils/formatter'
import { Controller } from 'react-hook-form'

import { OrderCreateContext } from '../../context/OrderCreateContext'
import { useOrderCreateHierarchyRow } from '../../hooks/useOrderCreateHierarchyRow'
import { loadReasons } from '../../order-create.service'
import { MappedMaterialData } from '../../order-create.type'
import { isHasQty, minMax } from '../../utils'
import OrderCreateHierarchySelectedMaterial from './OrderCreateHierarchySelectedMaterial'

type Props = {
  index: number
  item: MappedMaterialData
  onRemove: (index: number) => void
  onOpenDrawer: (value: number) => void
  onHandleInputChange: (
    value: string | number,
    index: number,
    field: 'ordered_qty' | 'order_reason_id' | 'other_reason'
  ) => void
}

export const OrderCreateHierarchyRow: React.FC<Props> = ({
  index,
  item,
  onRemove,
  onOpenDrawer,
  onHandleInputChange,
}) => {
  const {
    t,
    control,
    headers,
    activity,
    language,
    fieldError,
    order_items,
    enableReasons,
    recommendationQty,
    watchedOrderedQty,
    sumChildInputField,
    showRecommendation,
    checkChildInputField,
    register,
    trigger,
    clearErrors,
  } = useOrderCreateHierarchyRow({
    index,
    item,
  })

  const { isRelocation } = useContext(OrderCreateContext)

  return (
    <Tr key={item?.value?.material_id}>
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
      <Td
        className={`ui-align-top ui-text-sm ${getBackgroundStock(item?.value?.total_available_qty ?? 0, item?.value?.min ?? 0, item?.value?.max ?? 0)}`}
        id={`cell-${headers?.[2]?.id}`}
      >
        <div className="ui-flex ui-flex-col ui-text-dark-blue ui-text-sm">
          <p id={`cell-${headers?.[2]?.id}-on_hand_stock`}>
            {numberFormatter(item?.value?.total_qty || 0, language)}
          </p>
          <p
            className="ui-text-[#737373] ui-text-sm"
            id={`cell-${headers?.[2]?.id}-min_max`}
          >
            {minMax(item?.value?.min ?? 0, item?.value?.max ?? 0, language)}
          </p>
        </div>
      </Td>
      <Td className="ui-align-top" id={`cell-${headers?.[3]?.id}`}>
        <div className="ui-flex ui-flex-col ui-gap-2">
          <FormControl>
            <Controller
              control={control}
              name={`order_items.${index}.value.ordered_qty`}
              render={() => (
                <Fragment>
                  <InputNumberV2
                    disabled={checkChildInputField}
                    id={`cell-${headers?.[3]?.id}-${index}-ordered_qty`}
                    key={`ordered_qty_${index}-${sumChildInputField}`}
                    placeholder={numberFormatter(recommendationQty, language)}
                    value={
                      !checkChildInputField
                        ? watchedOrderedQty || ''
                        : sumChildInputField || ''
                    }
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
                          {fieldError?.ordered_qty?.message.map((message) => (
                            <FormErrorMessage key={message}>
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
                </Fragment>
              )}
            />
          </FormControl>

          {showRecommendation && recommendationQty !== 0 && (
            <div
              id={`cell-${headers?.[3]?.id}-${index}-recommendation`}
              className="ui-mt-2"
            >
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

          <Exists useIt={isHasQty(item?.value?.children)}>
            <div className="ui-flex ui-flex-col">
              {item?.value?.children?.map((stock, indexBatch) => {
                return (
                  <OrderCreateHierarchySelectedMaterial
                    key={`${index}-${indexBatch}`}
                    index={index}
                    indexBatch={indexBatch}
                    stock={stock}
                  />
                )
              })}
            </div>
          </Exists>

          <Button
            variant="outline"
            onClick={() => {
              onOpenDrawer(index)
            }}
            id={`see-detail-material-add-stock-${index}`}
            className="ui-flex ui-space-x-2 ui-items-center"
          >
            {!isHasQty(item?.value?.children) && <Plus />}
            <div className="ui-text-sm">
              {isHasQty(item?.value?.children)
                ? t('orderCreate:button.trademark.update')
                : t('orderCreate:button.trademark.add')}
            </div>
          </Button>
        </div>
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
                additional={{
                  page: 1,
                  type: isRelocation ? 'relocation' : 'request',
                }}
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
          {t('common:remove')}
        </Button>
      </Td>
    </Tr>
  )
}
