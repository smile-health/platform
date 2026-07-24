import React from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input, InputPassword } from '#components/input'
import AuthLayout from '#components/layouts/AuthLayout/index'
import { toast } from '#components/toast'
import { useFirebaseMessaging } from '#hooks/useFirebaseMessaging'
import { requestlogin, RequestloginBody } from '#services/auth'
import { useAuth } from '#store/auth.store'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import { loginFormSchema } from './schema/LoginSchemaForm'

type TFormData = {
  username: string
  password: string
}
type Message =
  | string
  | Array<{
      code: string
      minimum: number
      type: string
      inclusive: boolean
      exact: boolean
      message: string
      path: string[]
    }>

type LoginPageProps = {
  isPoc?: boolean
}

const LoginPage: React.FC<LoginPageProps> = ({ isPoc } = {}) => {

  const { t } = useTranslation('login')
  const { token } = useFirebaseMessaging()
  const { login } = useAuth()

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    setError,
  } = useForm<TFormData>({
    resolver: yupResolver(loginFormSchema(t)),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }: { data: RequestloginBody }) =>
      requestlogin({ data }),
    onSuccess: async (data) => {
      const authToken = data.authDetails.access_token
      const refreshToken = data.authDetails.refresh_token
      toast.success({
        description: t('success_login'),
        id: 'toast-success-login',
      })

      login({ token: authToken, refreshToken })
    },
    onError: (err: AxiosError) => {
      // Handle network/CORS errors where response is undefined
      if (!err.response) {
        toast.danger({
          description:
            t('network_error') ||
            'Network error. Please check your connection and try again.',
          id: 'toast-error-login',
        })
        return
      }

      // Original error handling for API errors
      const { message = t('invalid_login') } = err.response.data as {
        message: Message
      }
      if (typeof message === 'string') {
        toast.danger({ description: message, id: 'toast-error-login' })
      } else if (Array.isArray(message)) {
        for (const item of message) {
          if (item.path[0] === 'username' || item.path[0] === 'password') {
            setError(item.path[0], {
              message: item.message || '',
            })
          }
        }
      }
    },
  })

  const onSubmit = (values: TFormData) => {
    if (values.password.length < 8 || values.password.length > 20) {
      return toast.danger({
        description: t('invalid_login'),
        id: 'toast-error-login',
      })
    }
    mutate({
      data: {
        username: values?.username,
        password: values?.password,
        fcm_token: token ?? '',
      },
    })
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl className="ui-mb-6">
          <FormLabel required>Username</FormLabel>
          <Input
            placeholder="Username"
            {...register('username')}
            id="username"
          />
          {errors?.username?.message && (
            <FormErrorMessage className="ui-max-w-sm">
              {errors?.username?.message}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-mb-6">
          <FormLabel required>{t('password')}</FormLabel>
          <InputPassword
            placeholder={t('password')}
            {...register('password')}
            id="password"
          />
          {errors?.password?.message && (
            <FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
          )}
        </FormControl>
        <Button
          type="submit"
          variant="solid"
          id="btnLogin"
          className="ui-mb-10 ui-rounded-lg ui-mt-2 ui-w-full"
          disabled={!isValid}
          loading={isPending}
        >
          {isPending ? t('processing') : t('login')}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
