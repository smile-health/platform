import { Fragment, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import AuthLayout from '#components/layouts/AuthLayout/index'
import Meta from '#components/layouts/Meta'
import { toast } from '#components/toast'
import { requestForgotPassword } from '#services/auth'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import { forgotPasswordFormSchema } from './schema/ForgotPasswordSchemaForm'

type TFormData = yup.InferType<typeof forgotPasswordFormSchema>

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation(['common', 'forgot'])
  const [username, setUsername] = useState<string>('')
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    getValues,
  } = useForm<TFormData>({
    resolver: yupResolver(forgotPasswordFormSchema),
    defaultValues: {
      username: '',
    },
  })

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: TFormData) => requestForgotPassword(data),
    onSuccess: () => {
      toast.success({ description: 'Request successful' })
      setUsername(getValues('username'))
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }

      toast.danger({ description: message })
    },
  })

  const onSubmit = (values: TFormData) => mutate(values)

  return (
    <Fragment>
      <Meta title="SMILE | Forgot Password" />
      <AuthLayout>
        {!isSuccess ? (
          <Fragment>
            <h6 className="ui-font-bold ui-text-xl ui-mb-11">
              {t('forgot:title')}
            </h6>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl className="ui-mb-6">
                <FormLabel required>Username</FormLabel>
                <Input
                  placeholder="Username"
                  {...register('username')}
                  id="username"
                />
                {errors?.username?.message && (
                  <FormErrorMessage>
                    {errors?.username?.message}
                  </FormErrorMessage>
                )}
              </FormControl>
              <Button
                type="submit"
                variant="solid"
                id="btnForgotPassword"
                className="ui-mb-10 ui-rounded-full ui-mt-2 w-full"
                disabled={!isValid}
                loading={isPending}
              >
                {isPending ? 'Memproses' : 'Kirim'}
              </Button>
            </form>
          </Fragment>
        ) : (
          <div className="ui-flex ui-flex-col ui-gap-2 ui-my-24">
            <p className="ui-font-bold ui-text-xl">
              {t('forgot:success.description', { returnObjects: true })[0]}
            </p>
            <p className="ui-text-xs">
              {t('forgot:success.description', { returnObjects: true })[1]}
            </p>
            <button
              className="ui-font-bold ui-text-xs ui-mt-2 ui-text-success-500 ui-cursor-pointer"
              onClick={() => mutate({ username })}
            >
              {t('forgot:success.description', { returnObjects: true })[2]}
            </button>
          </div>
        )}
      </AuthLayout>
    </Fragment>
  )
}

export default ForgotPassword
