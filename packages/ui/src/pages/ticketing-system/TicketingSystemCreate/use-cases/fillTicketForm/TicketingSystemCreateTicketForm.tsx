import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { parseDate } from '@internationalized/date'
import { Button } from '#components/button'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { reValidateQueryFetchInfiniteScroll } from '#components/infinite-scroll-list'
import { Input } from '#components/input'
import { Radio, RadioGroup } from '#components/radio'
import { ReactSelectAsync } from '#components/react-select'
import { USER_ROLE } from '#constants/roles'
import { loadEntities } from '#services/entity'
import { handleDateChange, parseValidDate } from '#utils/date'
import { clearField } from '#utils/form'
import { getUserStorage } from '#utils/storage/user'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import {
  OrderStatusEnum,
  OrderTypeEnum,
} from '../../../../order/order.constant'
import { loadListOrders } from '../../../../order/OrderList/order-list.service'
import { useTicketingSystemCreateContext } from '../../TicketingSystemCreateProvider'

const TicketingSystemCreateTicketForm = () => {
  const { t } = useTranslation([
    'common',
    'ticketingSystem',
    'ticketingSystemCreate',
  ])
  const user = getUserStorage()

  const ticketingSystemCreate = useTicketingSystemCreateContext()
  const form = ticketingSystemCreate.form
  const errors = form.formState.errors

  const handleHasOrderChange = (value: 1 | 0) => {
    form.setValue('has_order', value)
    form.setValue('order_id', null)
    form.resetField('order_id')
    form.setValue('do_number', null)
    form.setValue('accept_terms', false)

    ticketingSystemCreate.materialSelection.removeAllSelected()

    if (form.formState.isSubmitted) {
      form.trigger('order_id')
      form.trigger('do_number')
    }
  }

  return (
    <>
      <div className="ui-w-full ui-px-6 ui-py-6 ui-border ui-border-gray-300 ui-rounded ui-flex ui-flex-col space-y-6">
        <div className="ui-font-semibold ui-text-gray-800">
          {t('ticketingSystemCreate:section.ticket_form.title')}
        </div>

        <FormControl>
          <FormLabel>{t('common:form.entity.label')}</FormLabel>
          <ReactSelectAsync
            {...form.register('entity')}
            selectRef={form.register('entity').ref}
            name="entity"
            value={form.watch('entity')}
            id="entity"
            data-testid="entity"
            loadOptions={loadEntities}
            debounceTimeout={300}
            isClearable
            placeholder={t('common:form.entity.placeholder')}
            additional={{
              page: 1,
            }}
            onChange={(option) => {
              reValidateQueryFetchInfiniteScroll()
              form.setValue('entity', option)
              ticketingSystemCreate.materialSelection.removeAllSelected()
              clearField({
                setValue: form.setValue,
                name: ['order_id', 'no_packing_slip'],
              })
            }}
            menuPortalTarget={document.body}
            disabled={user?.role === USER_ROLE.MANAGER}
            error={Boolean(errors.entity)}
          />
          {errors.entity?.message && (
            <FormErrorMessage>{errors.entity.message}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>
            {t('ticketingSystemCreate:field.is_submitted_on_smile.label')}
          </FormLabel>
          <RadioGroup>
            <Radio
              {...form.register('has_order')}
              name="has_order"
              id="has_order-yes"
              data-testid="has_order-yes"
              value="1"
              checked={Number(form.watch('has_order')) === 1}
              label={t('ticketingSystemCreate:field.is_submitted_on_smile.yes')}
              onChange={() => handleHasOrderChange(1)}
            />
            <Radio
              {...form.register('has_order')}
              name="has_order"
              id="has_order-no"
              data-testid="has_order-no"
              value="0"
              checked={Number(form.watch('has_order')) === 0}
              label={t('ticketingSystemCreate:field.is_submitted_on_smile.no')}
              onChange={() => handleHasOrderChange(0)}
            />
          </RadioGroup>
          {errors.has_order?.message && (
            <FormErrorMessage>{errors.has_order.message}</FormErrorMessage>
          )}
        </FormControl>

        <div className="ui-grid-cols-2 ui-gap-2 grid">
          <FormControl>
            <FormLabel>
              {t('ticketingSystemCreate:field.order_number.label')}
            </FormLabel>
            <ReactSelectAsync
              {...form.register('order_id')}
              selectRef={form.register('order_id').ref}
              name="order_id"
              inputType="number"
              key={`order_id-entity_${form.getValues('entity.value')}`}
              id="order_id"
              data-testid="order_id"
              value={form.watch('order_id')}
              loadOptions={loadListOrders}
              debounceTimeout={300}
              isClearable
              placeholder={t(
                'ticketingSystemCreate:field.order_number.placeholder'
              )}
              additional={{
                page: 1,
                purpose: 'purchase',
                customer_id: form.watch('entity.value'),
                status_ids: [
                  OrderStatusEnum.Shipped,
                  OrderStatusEnum.Fulfilled,
                ].join(','),
                type_ids: [
                  OrderTypeEnum.Request,
                  OrderTypeEnum.Distribution,
                  OrderTypeEnum.CentralDistribution,
                ].join(','),
              }}
              onChange={(option) => {
                form.setValue('order_id', option)
              }}
              onBlur={() => {
                form.trigger('order_id')
              }}
              menuPortalTarget={document.body}
              error={Boolean(errors.order_id?.message)}
              disabled={Number(form.watch('has_order')) === 0}
            />
            {errors.order_id?.message && (
              <FormErrorMessage>{errors.order_id?.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>
              {t('ticketingSystemCreate:field.do_number.label')}
            </FormLabel>
            <Input
              {...form.register('do_number')}
              name="do_number"
              id="do_number"
              data-testid="do_number"
              placeholder={t(
                'ticketingSystemCreate:field.do_number.placeholder'
              )}
              value={form.watch('do_number') || ''}
              type="text"
              min={0}
              error={Boolean(errors.do_number?.message)}
              onChange={(e) => {
                form.setValue('do_number', e.target.value)
                form.trigger('do_number')
              }}
              disabled={Number(form.watch('has_order')) === 1}
            />
            {errors.do_number?.message && (
              <FormErrorMessage>{errors.do_number.message}</FormErrorMessage>
            )}
          </FormControl>
        </div>

        <FormControl>
          <FormLabel required>
            {t('ticketingSystemCreate:field.arrival_date.label')}
          </FormLabel>
          <DatePicker
            {...form.register('arrived_date')}
            aria-label="arrived_date"
            name="arrived_date"
            id="arrived_date"
            data-testid="arrived_date"
            value={parseValidDate(form.watch('arrived_date'))}
            onChange={handleDateChange((value: string) =>
              form.setValue('arrived_date', value)
            )}
            onBlur={() => {
              form.trigger('arrived_date')
            }}
            minValue={parseDate(
              dayjs(new Date('2020-01')).format('YYYY-MM-DD')
            )}
            maxValue={parseDate(dayjs(new Date()).format('YYYY-MM-DD'))}
            error={Boolean(errors.arrived_date?.message)}
            clearable
          />
          {errors.arrived_date?.message && (
            <FormErrorMessage>{errors.arrived_date?.message}</FormErrorMessage>
          )}
        </FormControl>

        {Boolean(form.watch('order_id')) && (
          <div className="ui-flex ui-flex-grow ui-justify-end ui-items-end">
            <Button
              id="submit"
              data-testid="submit"
              variant="outline"
              onClick={ticketingSystemCreate.orderDetail.openDrawer}
              size="sm"
              leftIcon={<DocumentTextIcon width={20} />}
            >
              {t('ticketingSystem:button.view_detail_order')}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

export default TicketingSystemCreateTicketForm
