import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { ReactSelectAsync } from '#components/react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadCCEIGATDescriptions, loadPQSType } from '../pqs.service'
import { CreatePQSFormInput } from '../pqs.types'

const PQSFormDetail = () => {
  const { t } = useTranslation('pqs')
  const {
    control,
    formState: { errors },
  } = useFormContext<CreatePQSFormInput>()

  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('detail.section.detail.header')}
      </div>
      <div className="ui-grid ui-grid-cols-2 ui-gap-5">
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="code" required>
            {t('form.pqs_code.label')}
          </FormLabel>
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                id="code"
                placeholder={t('pqs:form.pqs_code.placeholder')}
                error={!!error?.message}
              />
            )}
          />
          {errors?.code?.message && (
            <FormErrorMessage>{errors?.code?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="pqs_type_id" required>
            {t('form.pqs_type.label')}
          </FormLabel>
          <Controller
            name="pqs_type_id"
            control={control}
            render={({
              field: { onChange, ...field },
              fieldState: { error },
            }) => (
              <ReactSelectAsync
                {...field}
                id="pqs_type_id"
                key={`pqs__type__${field.value?.value}`}
                isClearable
                disabled={false}
                loadOptions={(keyword, _, additional: { page: number }) =>
                  loadPQSType(keyword, _, {
                    ...additional,
                    page: additional?.page ?? 1,
                  }) as any
                }
                placeholder={t('form.pqs_type.placeholder')}
                onChange={(selected) => {
                  onChange(selected)
                }}
                additional={{
                  page: 1,
                }}
                error={!!error?.message}
              />
            )}
          />
          {errors?.pqs_type_id?.message && (
            <FormErrorMessage>{errors?.pqs_type_id?.message}</FormErrorMessage>
          )}
        </FormControl>
      </div>
      <div className="ui-grid ui-grid-cols-1 ui-mt-5">
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="cceigat_description_id">
            {t('form.cceigat_desc.label')}
          </FormLabel>
          <Controller
            name="cceigat_description_id"
            control={control}
            render={({
              field: { onChange, ...field },
              fieldState: { error },
            }) => (
              <ReactSelectAsync
                {...field}
                id="cceigat_description_id"
                isClearable
                disabled={false}
                loadOptions={(keyword, _, additional: { page: number }) =>
                  loadCCEIGATDescriptions(keyword, _, {
                    ...additional,
                    page: additional?.page ?? 1,
                  }) as any
                }
                placeholder={t('form.cceigat_desc.placeholder')}
                onChange={(selected) => {
                  onChange(selected)
                }}
                additional={{
                  page: 1,
                }}
                error={!!error?.message}
              />
            )}
          />

          {errors?.cceigat_description_id?.message && (
            <FormErrorMessage>
              {typeof errors?.cceigat_description_id?.message === 'string' &&
                errors?.cceigat_description_id?.message}
            </FormErrorMessage>
          )}
        </FormControl>
      </div>
    </div>
  )
}

export default PQSFormDetail
