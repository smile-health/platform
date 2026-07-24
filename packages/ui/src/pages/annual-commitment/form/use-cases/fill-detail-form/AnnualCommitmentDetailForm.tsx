import { useState } from 'react'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { ReactSelectAsync } from '#components/react-select'
import { TextArea } from '#components/text-area'
import { loadEntities } from '#services/entity'
import { useTranslation } from 'react-i18next'

import { loadContractNumbers } from '../../../../order/OrderCreateCentralDistribution/order-create-central-distribution.service'
import {
  calendarDateToDate,
  dateToCalendarDate,
  loadYears,
} from '../../annual-commitment-form.helper'
import { useAnnualCommitmentForm } from '../../AnnualCommitmentFormContext'

export const AnnualCommitmentDetailForm = () => {
  const { t } = useTranslation(['common', 'annualCommitmentForm'])
  const [newPoNumber, setNewPoNumber] = useState<string | undefined>(undefined)
  const { form, mode, id } = useAnnualCommitmentForm()

  const isEditMode = mode === 'edit'

  return (
    <div className="ui-w-full ui-px-6 ui-py-6 ui-border ui-border-gray-300 ui-rounded ui-flex ui-flex-col ui-space-y-6">
      <div className="ui-font-semibold ui-text-gray-800">
        {t('annualCommitmentForm:section.detail.title')}
      </div>

      <div className="ui-grid ui-grid-cols-2 ui-gap-6">
        {/* Contract Number */}
        <FormControl className="ui-space-y-2">
          <FormLabel required>
            {t('annualCommitmentForm:field.contract_number.label')}
          </FormLabel>
          <ReactSelectAsync
            {...form.methods.register('contract_number')}
            selectRef={form.methods.register('contract_number').ref}
            name="contract_number"
            value={form.methods.watch('contract_number')}
            id="contract_number"
            placeholder={t(
              'annualCommitmentForm:field.contract_number.placeholder'
            )}
            loadOptions={loadContractNumbers}
            onInputChange={(value: string) => {
              setNewPoNumber(value)
            }}
            debounceTimeout={300}
            isClearable
            onChange={(option) => {
              form.methods.setValue('contract_number', option, {
                shouldValidate: true,
              })
            }}
            menuPosition="fixed"
            error={Boolean(form.errors.contract_number)}
            additional={(() => {
              const params: Parameters<typeof loadContractNumbers>[2] = {
                page: 1,
                is_available: 1,
              }
              if (newPoNumber) {
                params.po_number = newPoNumber
                params.label = t('annualCommitmentForm:option.create', {
                  value: newPoNumber,
                }) as string
              }
              if (isEditMode && id) {
                params.commitment_id = String(id)
              }
              return params
            })()}
          />
          {form.errors.contract_number && (
            <FormErrorMessage>
              {form.errors.contract_number.message}
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Year */}
        <FormControl className="ui-space-y-2">
          <FormLabel required>
            {t('annualCommitmentForm:field.year.label')}
          </FormLabel>
          <ReactSelectAsync
            {...form.methods.register('year')}
            selectRef={form.methods.register('year').ref}
            name="year"
            value={form.methods.watch('year')}
            id="year"
            placeholder={t('annualCommitmentForm:field.year.placeholder')}
            loadOptions={loadYears}
            debounceTimeout={300}
            isClearable
            onChange={(option) => {
              form.methods.setValue('year', option, { shouldValidate: true })
            }}
            menuPosition="fixed"
            error={Boolean(form.errors.year)}
            additional={{ page: 1 }}
          />
          {form.errors.year && (
            <FormErrorMessage>{form.errors.year.message}</FormErrorMessage>
          )}
        </FormControl>

        {/* Contract Start Date */}
        <FormControl className="ui-space-y-2">
          <FormLabel required>
            {t('annualCommitmentForm:field.contract_start_date.label')}
          </FormLabel>
          <DatePicker
            value={dateToCalendarDate(
              form.methods.watch('contract_start_date')
            )}
            onChange={(value) => {
              form.methods.setValue(
                'contract_start_date',
                calendarDateToDate(value),
                { shouldValidate: true }
              )
            }}
            error={Boolean(form.errors.contract_start_date)}
            clearable
          />
          {form.errors.contract_start_date && (
            <FormErrorMessage>
              {form.errors.contract_start_date.message}
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Contract End Date */}
        <FormControl className="ui-space-y-2">
          <FormLabel required>
            {t('annualCommitmentForm:field.contract_end_date.label')}
          </FormLabel>
          <DatePicker
            value={dateToCalendarDate(form.methods.watch('contract_end_date'))}
            minValue={dateToCalendarDate(
              form.methods.watch('contract_start_date')
            )}
            onChange={(value) => {
              form.methods.setValue(
                'contract_end_date',
                calendarDateToDate(value),
                { shouldValidate: true }
              )
            }}
            error={Boolean(form.errors.contract_end_date)}
            clearable
          />
          {form.errors.contract_end_date && (
            <FormErrorMessage>
              {form.errors.contract_end_date.message}
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Supplier */}
        <FormControl className="ui-space-y-2">
          <FormLabel required>
            {t('annualCommitmentForm:field.supplier.label')}
          </FormLabel>
          <ReactSelectAsync
            {...form.methods.register('supplier')}
            selectRef={form.methods.register('supplier').ref}
            name="supplier"
            value={form.methods.watch('supplier')}
            id="supplier"
            placeholder={t('annualCommitmentForm:field.supplier.placeholder')}
            loadOptions={loadEntities}
            debounceTimeout={300}
            isClearable
            onChange={(option) => {
              form.methods.setValue('supplier', option, { shouldValidate: true })
            }}
            menuPosition="fixed"
            error={Boolean(form.errors.supplier)}
            additional={{
              page: 1,
              isGlobal: false,
              entity_tag_ids: 1,
              is_vendor: 1,
            }}
          />
          {form.errors.supplier && (
            <FormErrorMessage>{form.errors.supplier.message}</FormErrorMessage>
          )}
        </FormControl>

        {/* Description */}
        <FormControl className="ui-space-y-2">
          <FormLabel>
            {t('annualCommitmentForm:field.description.label')}
          </FormLabel>
          <TextArea
            {...form.methods.register('description')}
            id="description"
            placeholder={t(
              'annualCommitmentForm:field.description.placeholder'
            )}
            rows={3}
          />
        </FormControl>
      </div>
    </div>
  )
}
