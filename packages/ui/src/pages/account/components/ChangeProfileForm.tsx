import React, { Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { parseDate } from '@internationalized/date'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import { DatePicker } from '#components/date-picker'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputPhone } from '#components/input-phone'
import { Loading } from '#components/loading'
import { OptionType, ReactSelect } from '#components/react-select'
import { toast } from '#components/toast'
import { pattern } from '#constants/pattern'
import { GetProfileResponse } from '#services/profile'
import { updateUser, UpdateUserBody } from '#services/user'
import { ErrorResponse } from '#types/common'
import { TProgram } from '#types/program'
import { parseValidDate } from '#utils/date'
import { removeEmptyObject } from '#utils/object'
import { AxiosError } from 'axios'
import dayjs from 'dayjs'
import { DateValue } from 'react-aria'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import { emailRegex, genderList as getGenderList } from '../constants'

type ProfileFormValues = {
  firstname: string
  lastname: string | null
  gender: number
  mobile_phone: string | null
  email: string
  address: string
  date_of_birth: string | null
}

type ChangeProfileFormProps = {
  data?: GetProfileResponse
}

export const ChangeProfileFrom: React.FC<ChangeProfileFormProps> = ({
  data,
}) => {
  const router = useRouter()
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'account'])
  const queryClient = useQueryClient()

  const schema = yup.object().shape({
    firstname: yup
      .string()
      .required(t('account:form.validation.first_name_required')),
    lastname: yup.string().notRequired(),
    gender: yup.number().notRequired(),
    mobile_phone: yup
      .string()
      .nullable()
      .test('phone-match', t('common:validation.numeric_only'), (phone) => {
        if (!phone) return true

        return pattern.NUMERIC_ONLY.test(phone)
      }),
    address: yup.string().notRequired(),
    date_of_birth: yup.string().notRequired(),
    email: yup.string().matches(emailRegex, {
      message: t('account:form.validation.email'),
    }),
  })

  const {
    setValue,
    watch,
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isValid },
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
    mode: 'onChange',
    defaultValues: {
      firstname: data?.firstname ?? '',
      lastname: data?.lastname ?? null,
      gender: data?.gender ?? 0,
      mobile_phone: data?.mobile_phone ?? null,
      email: data?.email ?? '',
      address: data?.address ?? '',
      date_of_birth: data?.date_of_birth ?? null,
    },
  })

  const { mutate: mutateProfile, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserBody }) =>
      updateUser(id, data),
    onSuccess: () => {
      toast.success({
        description: t('account:form.message.change_profile_success'),
        id: 'successChangeProfile',
        duration: 2000,
      })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      router.back()
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({
          description: error.response?.data?.message,
          id: 'errorChangeProfile',
          duration: 4000,
        })
        const errors = response?.errors || {}
        for (const item of Object.keys(errors)) {
          setError(item as keyof ProfileFormValues, {
            message: errors?.[item]?.[0],
          })
        }
      }
    },
  })

  const onValid: SubmitHandler<ProfileFormValues> = (formData) => {
    const newValues = {
      ...formData,
      date_of_birth: formData.date_of_birth ?? '',
      mobile_phone: formData?.mobile_phone ?? null,
      lastname: formData?.lastname ?? null,
      entity_id: data?.entity_id ?? 0,
      role: data?.role ?? 0,
      username: data?.username ?? '',
      view_only: data?.view_only ?? 0,
      address: formData?.address || '',
      village_id: data?.village_id ?? '',
      program_ids: data?.programs?.map((w: TProgram) => w.id) || [],
    }

    const formattedValues = removeEmptyObject(newValues)

    const payload = {
      ...formattedValues,
      lastname: formattedValues?.lastname ?? null,
      mobile_phone: formattedValues?.mobile_phone ?? null,
    }

    mutateProfile({ id: (data?.id as number).toString(), data: payload })
  }

  const gender = watch('gender')
  const genderList = getGenderList(language)

  return (
    <form onSubmit={handleSubmit(onValid)}>
      {isPending && <Loading overlay />}
      <div className="ui-max-w-[800px] ui-mx-auto">
        <div className="ui-border ui-rounded ui-border-[#d2d2d2] ui-mt-8 ui-p-6  ui-grid ui-grid-cols-1 ui-gap-x-4">
          <h5 className="mb-6 font-bold">{t('account:title.main_info')}</h5>
          <div className="ui-grid ui-grid-cols-2 ui-gap-x-4">
            <FormControl className="relative mb-6">
              <FormLabel id="labelFirstname" htmlFor="firstname" required>
                {t('account:form.label.firstname')}
              </FormLabel>
              <Input
                {...register('firstname')}
                id="firstname"
                placeholder={t('account:form.placeholder.firstname')}
                type="text"
              />
              {errors?.firstname?.message && (
                <FormErrorMessage id="errorFirstName">
                  {errors?.firstname?.message}
                </FormErrorMessage>
              )}
            </FormControl>

            <FormControl className="relative mb-6">
              <FormLabel id="labelLastname" htmlFor="firstname">
                {t('account:form.label.lastname')}
              </FormLabel>
              <Input
                {...register('lastname')}
                id="lastname"
                placeholder={t('account:form.placeholder.lastname')}
                type="text"
              />
              {errors?.lastname?.message && (
                <FormErrorMessage id="errorLastName">
                  {errors?.lastname?.message}
                </FormErrorMessage>
              )}
            </FormControl>
          </div>
          <FormControl className="relative mb-6">
            <FormLabel id="labelGender" htmlFor="firstname">
              {t('account:form.label.gender')}
            </FormLabel>
            <ReactSelect
              {...register('gender')}
              id="gender"
              key={language}
              placeholder={t('account:form.placeholder.gender')}
              options={genderList}
              onChange={(e: OptionType) => setValue('gender', e?.value)}
              value={
                gender ? genderList?.find((v) => v?.value === gender) : null
              }
            />
            {errors?.gender?.message && (
              <FormErrorMessage id="errorGender">
                {errors?.gender?.message}
              </FormErrorMessage>
            )}
          </FormControl>

          <FormControl className="ui-relative ui-mb-6">
            <FormLabel id="labelEmail" htmlFor="email" required>
              {t('account:form.label.email')}
            </FormLabel>
            <Input
              {...register('email')}
              id="email"
              placeholder={t('account:form.placeholder.email')}
              type="text"
            />
            {errors?.email?.message && (
              <FormErrorMessage id="errorEmail">
                {errors?.email?.message}
              </FormErrorMessage>
            )}
          </FormControl>
        </div>

        <div className="ui-border ui-rounded ui-border-[#d2d2d2] ui-mt-8 ui-p-6  ui-grid ui-grid-cols-1 ui-gap-x-4">
          <h5 className="mb-6 font-bold">
            {t('account:title.additional_info')}
          </h5>
          <FormControl className="ui-relative ui-mb-6">
            <FormLabel id="labelAddress" htmlFor="address">
              {t('account:form.label.address')}
            </FormLabel>
            <Input
              {...register('address')}
              id="address"
              placeholder={t('account:form.placeholder.address')}
              type="text"
            />
            {errors?.address?.message && (
              <FormErrorMessage id="errorAddress">
                {errors?.address?.message}
              </FormErrorMessage>
            )}
          </FormControl>

          <FormControl className="relative mb-6">
            <FormLabel id="labelDateOfBirth" htmlFor="date_of_birth">
              {t('account:form.label.date_of_birth')}
            </FormLabel>
            <Controller
              name="date_of_birth"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState: { error },
              }) => {
                return (
                  <Fragment>
                    <DatePicker
                      {...field}
                      id="datepicker-date_of_birth"
                      value={value ? parseValidDate(value.split('T')[0]) : null}
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
                  </Fragment>
                )
              }}
            />
          </FormControl>
          <FormControl className="ui-relative ui-mb-6">
            <Controller
              name="mobile_phone"
              control={control}
              render={({
                field: { value, onChange, ...field },
                fieldState: { error },
              }) => (
                <FormControl className="ui-col-span-2">
                  <FormLabel htmlFor="input-phone-number">
                    {t('account:form.label.mobile_phone')}
                  </FormLabel>
                  <InputPhone
                    {...field}
                    id="input-phone-number"
                    error={Boolean(error?.message)}
                    onChange={(value) => onChange(value || '')}
                    value={value ?? ''}
                    placeholder={t('account:form.placeholder.mobile_phone')}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
          </FormControl>
        </div>
        <div className="ui-flex ui-justify-end ui-mt-6 ui-gap-4">
          <Button
            type="button"
            className="ui-w-40 ui-h-10"
            id="btnBack"
            variant="outline"
            onClick={() => router.back()}
          >
            {t('common:back')}
          </Button>
          <Button
            className="ui-w-40 ui-h-10"
            disabled={!isValid}
            type="submit"
            id="btnSave"
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </form>
  )
}
