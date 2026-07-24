import React from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputPassword } from '#components/input'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import Meta from '#components/layouts/Meta'
import { Loading } from '#components/loading'
import { toast } from '#components/toast'
import { pattern } from '#constants/pattern'
import useSmileRouter from '#hooks/useSmileRouter'
import {
  requestlogout,
  updatePassword,
  UpdatePasswordBody,
} from '#services/auth'
import { ErrorResponse } from '#types/common'
import { removeAuthTokenCookies } from '#utils/storage/auth'
import { removeProgramStorage } from '#utils/storage/program'
import { generateMetaTitle } from '#utils/strings'
import { AxiosError } from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

type ChangePasswordFormValues = {
  password: ''
  new_password: ''
  password_confirmation: ''
}

export default function ChangePassword(): JSX.Element {
  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'account'])

  const schema = yup.object().shape({
    password: yup
      .string()
      .required(t('account:form.validation.empty_old_password'))
      .matches(
        pattern.PASSWORD,
        t('account:form.validation.password_validation_text')
      ),
    new_password: yup
      .string()
      .required(t('account:form.validation.empty_new_password'))
      .matches(
        pattern.PASSWORD,
        t('account:form.validation.password_validation_text')
      ),
    password_confirmation: yup
      .string()
      .oneOf(
        [yup.ref('new_password')],
        t('account:form.validation.password_confirmation_validation')
      )
      .required(t('account:form.validation.empty_confirmation_password')),
  })

  const {
    register,
    handleSubmit,
    setError,
    trigger,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      new_password: '',
      password_confirmation: '',
    },
  })

  const { mutate: handleLogout } = useMutation({
    mutationFn: requestlogout,
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }

      toast.danger({ description: message })
    },
    onSuccess: () => {
      removeAuthTokenCookies()
      removeProgramStorage()
      localStorage.clear()
      setTimeout(() => router.push(`/v5/login`), 100)
    },
  })

  const { mutate: mutatePassword, isPending: isPendingMutatePassword } =
    useMutation({
      mutationFn: (data: UpdatePasswordBody) => updatePassword(data),
      onSuccess: (res) => {
        toast.success({
          description: res.message,
          id: 'successChangePassword',
          duration: 2000,
        })
        handleLogout()
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        if (error instanceof AxiosError) {
          const response = error.response?.data as ErrorResponse
          toast.danger({
            description: error.response?.data?.message,
            id: 'errorChangePassword',
          })
          for (const item of Object.keys(response.errors as any)) {
            setError(item as keyof ChangePasswordFormValues, {
              message: response.errors?.[item]?.[0] as string,
            })
          }
        }
      },
    })

  const onValid: SubmitHandler<ChangePasswordFormValues> = (formData) => {
    if (formData?.password === formData?.new_password) {
      return ['new_password'].forEach(
        (item: keyof ChangePasswordFormValues) => {
          setError(item, {
            message: t('account:form.validation.old_password_same_with_new'),
          })
        }
      )
    }
    return mutatePassword(formData)
  }

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    register('new_password').onChange(e)
    trigger('password_confirmation')
  }

  return (
    <AppLayout title={t('account:title.edit_password')}>
      <Meta title={generateMetaTitle(t('account:title.edit_password'))} />
      <form onSubmit={handleSubmit(onValid)}>
        {isPendingMutatePassword && <Loading overlay />}
        <div className="ui-max-w-[800px] ui-mx-auto">
          <div className="ui-border ui-rounded ui-border-[#d2d2d2] ui-mt-8 ui-p-4">
            <FormControl className="ui-relative ui-mb-6">
              <FormLabel id="labelPassword" htmlFor="password" required>
                {t('account:form.label.password')}
              </FormLabel>
              <InputPassword
                {...register('password')}
                id="password"
                placeholder={t('account:form.placeholder.password')}
                error={!!errors?.password?.message}
              />
              {errors?.password?.message && (
                <FormErrorMessage id="errorPassword">
                  {errors?.password?.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <div className="ui-grid ui-grid-cols-2 ui-gap-x-4">
              <FormControl className="ui-relative ui-mb-6">
                <FormLabel
                  id="labelNewPassword"
                  htmlFor="new_password"
                  required
                >
                  {t('account:form.label.new_password')}
                </FormLabel>
                <InputPassword
                  {...register('new_password')}
                  id="new_password"
                  placeholder={t('account:form.placeholder.new_password')}
                  onChange={handleNewPasswordChange}
                  error={!!errors?.new_password?.message}
                />
                {errors?.new_password?.message && (
                  <FormErrorMessage id="errorNewPassword">
                    {errors?.new_password?.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl className="ui-relative ui-mb-6">
                <FormLabel
                  id="labelPasswordConfirmation"
                  htmlFor="password_confirmation"
                  required
                >
                  {t('account:form.label.password_confirmation')}
                </FormLabel>
                <InputPassword
                  {...register('password_confirmation')}
                  id="password_confirmation"
                  placeholder={t(
                    'account:form.placeholder.password_confirmation'
                  )}
                  error={!!errors?.password_confirmation?.message}
                />
                {errors?.password_confirmation?.message && (
                  <FormErrorMessage id="errorPasswordConfirmation">
                    {errors?.password_confirmation?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            </div>
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
              disabled={!isValid}
              type="submit"
              className="ui-w-40 ui-h-10"
              id="btnSave"
            >
              {t('common:save')}
            </Button>
          </div>
        </div>
      </form>
    </AppLayout>
  )
}
