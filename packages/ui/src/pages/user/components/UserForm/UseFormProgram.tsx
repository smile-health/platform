import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import ProgramSelection from '#components/modules/ProgramSelection'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { ProgramIntegrationClient } from '#constants/program'
import cx from '#lib/cx'
import { loadCoreEntities } from '#services/entity'
import { TEntities } from '#types/entity'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CreateUserBody } from '../../user.service'

export type UseFormProgramValues = Pick<
  CreateUserBody,
  'program_ids' | 'integration_client_id'
> & {
  entity?:
    | (OptionType & Pick<TEntities, 'programs' | 'integration_client_id'>)
    | null
}

type Props = {
  isEdit?: boolean
}

export default function UseFormProgram({ isEdit }: Readonly<Props>) {
  const { t } = useTranslation(['common', 'user'])

  const {
    control,
    setValue,
    watch,
    formState: { defaultValues },
  } = useFormContext<UseFormProgramValues>()

  const { entity, program_ids, integration_client_id } = watch()

  const wmsId = useMemo(
    () =>
      entity?.programs?.find((p) => p.app_type === 'waste_management')?.id ??
      null,
    [entity]
  )

  const defaultEntity = defaultValues?.entity
  const isSameEntity = defaultEntity?.value === entity?.value

  const defaultProgramIds = (defaultValues?.program_ids ?? []) as number[]

  const forbiddenUncheckIds = useMemo(() => {
    if (!isSameEntity) return []
    return [
      ...(integration_client_id === ProgramIntegrationClient.WasteManagement &&
      wmsId
        ? [wmsId]
        : []),
      ...defaultProgramIds,
    ]
  }, [isSameEntity, integration_client_id, wmsId, defaultProgramIds])

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-6">
      <h5 className="ui-font-bold">{t('programs')}</h5>

      {/* Entity */}
      <Controller
        name="entity"
        control={control}
        render={({
          field: { onChange, value, ...field },
          fieldState: { error },
        }) => (
          <FormControl>
            <FormLabel htmlFor="select-entity" required>
              {t('form.entity.label')}
            </FormLabel>

            <ReactSelectAsync
              {...field}
              data-testid="select-entity"
              value={value ?? null}
              isClearable
              debounceTimeout={300}
              placeholder={t('form.entity.placeholder')}
              loadOptions={loadCoreEntities as any}
              additional={{ page: 1 }}
              onChange={(option) => {
                onChange(option)

                const selected = option as UseFormProgramValues['entity']

                setValue('program_ids', defaultProgramIds)

                setValue(
                  'integration_client_id',
                  selected?.integration_client_id ?? undefined
                )
              }}
            />

            {error?.message && (
              <FormErrorMessage>{error.message}</FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      {/* Programs */}
      {entity ? (
        <ProgramSelection
          key={entity?.value}
          selected={program_ids || []}
          onChange={(ids) => setValue('program_ids', ids)}
          forbiddenUncheckIds={forbiddenUncheckIds}
          programList={entity.programs}
          isEnabledApi={false}
          withLayout={false}
        />
      ) : (
        <div
          className={cx(
            'ui-flex ui-items-center ui-gap-2 ui-px-6 ui-py-2.5',
            'ui-bg-stone-100 ui-text-neutral-500',
            'ui-border ui-border-neutral-300 ui-rounded'
          )}
        >
          <InformationCircleIcon className="ui-size-4" />
          <p className="ui-text-sm">{t('user:form.entity.program')}</p>
        </div>
      )}
    </div>
  )
}
