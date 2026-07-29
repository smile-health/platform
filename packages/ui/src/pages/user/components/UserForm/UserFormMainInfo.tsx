import { Checkbox } from '#components/checkbox'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input, InputPassword } from '#components/input'
import { Radio } from '#components/radio'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { USER_ROLE } from '#constants/roles'
import { loadManufacturers } from '#services/manufacturer'
import { loadUserRoles } from '#services/user'
import { getUserStorage } from '#utils/storage/user'
import { isUserWMS } from '#utils/user'
import { useEffect, useRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { USER_GENDER } from '../../user.constants'
import { CreateUserBody } from '../../user.service'
import { UseFormProgramValues } from './UseFormProgram'

// Passthrough integration client id for the WMS client, used only to scope
// the role options query — matches apps/core's WMS_CLIENT_ID. Unrelated to
// the workspace/program `type` field used elsewhere to detect WMS.
const WMS_INTEGRATION_CLIENT_ID = 4

export type UserFormMainInfoValues = Pick<
  CreateUserBody,
  'username' | 'firstname' | 'lastname' | 'email' | 'password'
> & {
  manufacturer: OptionType | null
  entity: UseFormProgramValues['entity']
  role: OptionType<number>
  gender: string
  view_only: boolean
  password_confirmation?: string
  daily_recap_email?: number
  integration_client_id?: number
}

type UserFormMainInfoProps = {
  readonly isEdit?: boolean
}

export default function UserFormMainInfo({
  isEdit = false,
}: UserFormMainInfoProps) {
  const { t } = useTranslation('user')
  const user = getUserStorage()
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors, defaultValues },
  } = useFormContext<UserFormMainInfoValues>()

  const { role, entity } = watch()
  const programIds = watch('program_ids' as any) as number[] | undefined

  const isEntityIntegratedWithWMS = Boolean(
    entity?.programs?.some((program) => program.type === 'wms')
  )
  const isWmsChecked = Boolean(
    programIds?.some(
      (id) => entity?.programs?.find((program) => program.id === id)?.type === 'wms'
    )
  )
  const isWmsCheckedRef = useRef(isWmsChecked)

  useEffect(() => {
    if (isWmsCheckedRef.current !== isWmsChecked) {
      isWmsCheckedRef.current = isWmsChecked
      setValue('role', null as any)
    }
  }, [isWmsChecked, setValue])

  const shouldShowManufacturerField =
    !isUserWMS(user) &&
    (role?.value === USER_ROLE.MANUFACTURE ||
      role?.value === USER_ROLE.VENDOR_IOT)

  console.log(isEntityIntegratedWithWMS && isWmsChecked ? 'role_wms' : 'role')

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-6">
      <h5 className="font-bold">{t('title.main')}</h5>
      <div className="ui-grid ui-grid-cols-2 ui-gap-x-4 ui-gap-y-6">
        <FormControl className="ui-col-span-2">
          <FormLabel htmlFor="input-username" required>
            {t('form.username.label')}
          </FormLabel>
          <Input
            {...register('username')}
            data-testid="input-username"
            placeholder={t('form.username.placeholder')}
            type="text"
            autoComplete={isEdit ? 'username' : 'new-username'}
            error={!!errors?.username}
          />
          {errors?.username && (
            <FormErrorMessage>{errors?.username?.message}</FormErrorMessage>
          )}
        </FormControl>

        <Controller
          key={isEntityIntegratedWithWMS && isWmsChecked ? 'role_wms' : 'role'}
          name="role"
          control={control}
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl className="ui-col-span-2">
              <FormLabel htmlFor="input-role" required>
                {t('form.role.label')}
              </FormLabel>

              <ReactSelectAsync
                {...field}
                value={role}
                data-testid="input-role"
                placeholder={t('form.role.placeholder')}
                loadOptions={loadUserRoles}
                onChange={(option) => onChange(option)}
                menuPosition="fixed"
                isSearchable={false}
                additional={{
                  page: 1,
                  ...(isWmsChecked && {
                    integration_client_id: WMS_INTEGRATION_CLIENT_ID,
                  }),
                }}
              />

              <Checkbox
                {...register('view_only')}
                data-testid="cbx-view-only"
                label={
                  <div className="ui-flex ui-gap-2">
                    <span>{t('form.view_only.label')}</span>
                    <span className="ui-text-neutral-500 ui-text-sm ui-italic">
                      ({t('form.view_only.disabled_information')})
                    </span>
                  </div>
                }
                disabled={value?.value === USER_ROLE.SUPERADMIN}
              />

              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />

        <FormControl>
          <FormLabel htmlFor="input-firstname" required>
            {t('form.firstname.label')}
          </FormLabel>
          <Input
            {...register('firstname')}
            data-testid="input-firstname"
            placeholder={t('form.firstname.placeholder')}
            type="text"
            error={!!errors?.firstname}
          />
          {errors?.firstname && (
            <FormErrorMessage>{errors?.firstname?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="input-lastname">
            {t('form.lastname.label')}
          </FormLabel>
          <Input
            {...register('lastname')}
            data-testid="input-lastname"
            placeholder={t('form.lastname.placeholder')}
            type="text"
            error={!!errors?.lastname}
          />
          {errors?.lastname && (
            <FormErrorMessage>{errors?.lastname?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-col-span-2">
          <FormLabel htmlFor="input-email" required>
            Email
          </FormLabel>
          <Input
            {...register('email')}
            data-testid="input-email"
            placeholder={t('form.email.placeholder')}
            type="email"
            error={!!errors?.email}
          />
          <Checkbox
            {...register('daily_recap_email')}
            data-testid="cbx-daily-recap-email"
            label={t('form.email.daily_recap_email')}
          />
          <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
        </FormControl>
        <FormControl className="ui-col-span-2">
          <FormLabel required>{t('form.gender.label')}</FormLabel>
          <div className="ui-flex ui-items-center ui-gap-4">
            <Radio
              {...register('gender')}
              data-testid="radio-male"
              label={t('form.gender.male')}
              value={USER_GENDER.MALE}
            />
            <Radio
              {...register('gender')}
              data-testid="radio-female"
              label={t('form.gender.female')}
              value={USER_GENDER.FEMALE}
            />
          </div>

          {errors?.gender && (
            <FormErrorMessage>{errors?.gender?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="input-password" required={!isEdit}>
            {t('form.password.label')}
          </FormLabel>
          <InputPassword
            {...register('password')}
            data-testid="input-password"
            placeholder={t('form.password.placeholder')}
            error={!!errors?.password?.message}
            autoComplete={isEdit ? 'current-password' : 'new-password'}
          />
          {errors?.password && (
            <FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="input-password-confirmation" required={!isEdit}>
            {t('form.password_confirmation.label')}
          </FormLabel>
          <InputPassword
            {...register('password_confirmation')}
            data-testid="input-password-confirmation"
            placeholder={t('form.password_confirmation.placeholder')}
            error={!!errors?.password_confirmation?.message}
          />
          {errors?.password_confirmation && (
            <FormErrorMessage>
              {errors?.password_confirmation?.message}
            </FormErrorMessage>
          )}
        </FormControl>
      </div>
      {shouldShowManufacturerField && (
        <Controller
          control={control}
          key={role.value}
          name="manufacturer"
          render={({ field: { ...field }, fieldState: { error } }) => (
            <FormControl>
              <FormLabel htmlFor="select-manufacturer" required>
                {t('form.manufacturer.label')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-manufacturer"
                data-testid="select-manufacturer"
                loadOptions={loadManufacturers}
                debounceTimeout={300}
                isClearable
                placeholder={t('form.manufacturer.placeholder')}
                additional={{
                  page: 1,
                  status: 1,
                }}
                error={!!error?.message}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      )}
    </div>
  )
}
