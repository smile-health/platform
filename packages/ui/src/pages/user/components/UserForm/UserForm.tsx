'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '#components/button'
import { TUserDetail } from '#types/user'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useUserCreate from '../../hooks/useUserCreate'
import UseFormProgram, { UseFormProgramValues } from './UseFormProgram'
import UserFormAdditionalInfo, {
  UserFormAdditionalInfoValues,
} from './UserFormAdditionalInfo'
import UserFormMainInfo, { UserFormMainInfoValues } from './UserFormMainInfo'

type UserFormValues = UserFormMainInfoValues &
  UserFormAdditionalInfoValues &
  UseFormProgramValues

type UserFormProps = {
  defaultValues?: TUserDetail
}

const UserForm = ({ defaultValues }: UserFormProps) => {
  const params = useParams()
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'user'])
  const isEdit = Boolean(params?.id)

  const { methods, onSubmit, isPending } = useUserCreate<UserFormValues>({
    defaultValues,
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto">
          <UserFormMainInfo isEdit={isEdit} />
          <UserFormAdditionalInfo />

          <UseFormProgram isEdit={isEdit} />

          <div className="ui-flex ui-justify-end">
            <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
              <Button
                asChild
                data-testid="btn-back"
                type="button"
                variant="outline"
              >
                <Link href={`/${language}/v5/global-settings/user`}>
                  {t('common:back')}
                </Link>
              </Button>
              <Button
                data-testid="btn-submit"
                type="submit"
                loading={isPending}
              >
                {t('common:save')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default UserForm
