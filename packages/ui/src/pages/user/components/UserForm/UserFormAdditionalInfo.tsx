import { parseDate } from '@internationalized/date'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from '#components/accordion'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputPhone } from '#components/input-phone'
import { CommonPlaceSelector } from '#components/modules/CommonPlaceSelector'
import { OptionType } from '#components/react-select'
import { isValidDate } from '#utils/date'
import { clearField } from '#utils/form'
import { getReactSelectValue } from '#utils/react-select'
import dayjs from 'dayjs'
import { DateValue } from 'react-aria'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CreateUserBody } from '../../user.service'

export type UserFormAdditionalInfoValues = Pick<
  CreateUserBody,
  'address' | 'village_id' | 'date_of_birth' | 'mobile_phone'
> & {
  province?: OptionType | null
  regency?: OptionType | null
  sub_district?: OptionType | null
  village?: OptionType | null
}

export default function UserFormAdditionalInfo() {
  const { t } = useTranslation(['common', 'user'])
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<UserFormAdditionalInfoValues>()

  const handleChange = (
    onChange: (option: OptionType) => void,
    option: OptionType
  ) => {
    onChange(option)
    setValue('village_id', String(option?.value))
  }

  const { province, regency, sub_district } = watch()

  return (
    <div className="ui-border ui-border-neutral-300 ui-rounded ui-space-y-6">
      <AccordionRoot
        className="additional-form-accordtion"
        type="single"
        collapsible
      >
        <AccordionItem value="additional-form" className="ui-border-none">
          <AccordionTrigger
            className="ui-rounded"
            data-testid="btn-additional-form"
          >
            <h5 className="ui-p-1 ui-pb-0 font-bold">
              {t('user:title.additional')}
            </h5>
          </AccordionTrigger>
          <AccordionContent>
            <div className="ui-grid ui-grid-cols-2 ui-gap-x-4 ui-gap-y-6 ui-p-1 ui-pt-0">
              <FormControl className="ui-col-span-2">
                <FormLabel htmlFor="textarea-address">
                  {t('user:form.address.label')}
                </FormLabel>
                <Input
                  {...register('address')}
                  data-testid="textarea-address"
                  placeholder={t('user:form.address.placeholder')}
                  type="text"
                  error={!!errors?.address?.message}
                />
                <FormErrorMessage>{errors?.address?.message}</FormErrorMessage>
              </FormControl>
              <Controller
                name="province"
                control={control}
                render={({
                  field: { onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl>
                    <FormLabel htmlFor="select-province">
                      {t('common:form.province.label')}
                    </FormLabel>
                    <CommonPlaceSelector
                      {...field}
                      data-testid="select-province"
                      level="province"
                      additional={{
                        page: 1,
                      }}
                      onChange={(option: OptionType) => {
                        handleChange(onChange, option)
                        clearField({
                          setValue,
                          name: ['regency', 'sub_district', 'village'],
                        })
                      }}
                    />

                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="regency"
                control={control}
                render={({
                  field: { onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl>
                    <FormLabel htmlFor="select-regency">
                      {t('common:form.city.label')}
                    </FormLabel>
                    <CommonPlaceSelector
                      {...field}
                      data-testid="select-regency"
                      level="regency"
                      disabled={!province}
                      additional={{
                        page: 1,
                        parent_id: getReactSelectValue(province),
                      }}
                      onChange={(option: OptionType) => {
                        handleChange(onChange, option)
                        clearField({
                          setValue,
                          name: ['sub_district', 'village'],
                        })
                      }}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="sub_district"
                control={control}
                render={({
                  field: { onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl>
                    <FormLabel htmlFor="select-subdistrict">
                      {t('common:form.subdistrict.label')}
                    </FormLabel>
                    <CommonPlaceSelector
                      {...field}
                      data-testid="select-subdistrict"
                      level="subdistrict"
                      disabled={!regency}
                      additional={{
                        page: 1,
                        parent_id: getReactSelectValue(regency),
                      }}
                      onChange={(option: OptionType) => {
                        handleChange(onChange, option)
                        clearField({
                          setValue,
                          name: 'village',
                        })
                      }}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="village"
                control={control}
                render={({
                  field: { onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl>
                    <FormLabel htmlFor="select-village">
                      {t('common:form.village.label')}
                    </FormLabel>
                    <CommonPlaceSelector
                      {...field}
                      data-testid="select-village"
                      level="village"
                      disabled={!sub_district}
                      additional={{
                        page: 1,
                        parent_id: getReactSelectValue(sub_district),
                      }}
                      onChange={(option: OptionType) => {
                        handleChange(onChange, option)
                      }}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="date_of_birth"
                render={({
                  field: { onChange, value, ...field },
                  fieldState: { error },
                }) => {
                  return (
                    <FormControl className="ui-col-span-2">
                      <FormLabel htmlFor="datepicker-birthday">
                        {t('user:form.birthdate.label')}
                      </FormLabel>
                      <DatePicker
                        {...field}
                        data-testid="datepicker-birthday"
                        value={
                          value && isValidDate(value) ? parseDate(value) : null
                        }
                        maxValue={parseDate(
                          dayjs(new Date()).format('YYYY-MM-DD')
                        )}
                        onChange={(date: DateValue) => {
                          const newDate = new Date(date?.toString())
                          onChange(dayjs(newDate).format('YYYY-MM-DD'))
                        }}
                        error={!!error?.message}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )
                }}
              />
              <Controller
                name="mobile_phone"
                control={control}
                render={({
                  field: { value, onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl className="ui-col-span-2">
                    <FormLabel htmlFor="input-phone-number">
                      {t('user:form.mobile_phone.label')}
                    </FormLabel>
                    <InputPhone
                      {...field}
                      data-testid="input-phone-number"
                      error={Boolean(error?.message)}
                      onChange={(value) => onChange(value || '')}
                      value={value ?? ''}
                      placeholder={t('user:form.mobile_phone.placeholder')}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </div>
  )
}
