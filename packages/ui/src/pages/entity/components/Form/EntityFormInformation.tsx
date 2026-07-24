import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { InputNumberV2 } from '#components/input-number-v2'
import { OptionType, ReactSelect } from '#components/react-select'
import { getEntityType, getGlobalEntityType } from '#services/entity'
import { CommonType } from '#types/common'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TFormData, TFormValidationKeys } from '../../hooks/useEntityForm'

type Props = CommonType & {
  materialTagList: Array<{ value: string | number; label: string }>
}

const paramsEntityType = { page: 1, paginate: 50 }

const EntityFormInformation: React.FC<Props> = ({
  materialTagList,
  isGlobal,
}) => {
  const { t } = useTranslation(['entity', 'common'])

  const { data: typeOptions } = useQuery({
    queryKey: ['typeOptions'],
    queryFn: () =>
      isGlobal
        ? getGlobalEntityType(paramsEntityType)
        : getEntityType(paramsEntityType),
    select: (res) => res.data.map((x) => ({ value: x.id, label: x.name })),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = useFormContext<TFormData>()

  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold">
        {t('entity:form.information.title')}
      </div>

      <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
        <FormControl>
          <FormLabel>{t('entity:satu_sehat_code')}</FormLabel>
          <InputNumberV2
            {...register('id_satu_sehat')}
            id="input-satu-sehat-code"
            placeholder={t('entity:placeholder_satu_sehat_code')}
            value={watch('id_satu_sehat') ?? null}
            onValueChange={(values) => {
              setValue('id_satu_sehat', String(values?.floatValue ?? null))
            }}
            isPlainFormat={true}
            limit={10}
          />
          {errors?.id_satu_sehat?.message && (
            <FormErrorMessage>
              {t(errors?.id_satu_sehat?.message as TFormValidationKeys)}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel required>
            {t('entity:form.information.label.code')}
          </FormLabel>
          <Input
            {...register('code')}
            id="input-entity-code"
            placeholder={`${t('common:example')} : 123ABC`}
            maxLength={255}
            className="uppercase"
          />
          {errors?.code?.message && (
            <FormErrorMessage>
              {t(errors?.code?.message as TFormValidationKeys)}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel required>
            {t('entity:form.information.label.name')}
          </FormLabel>
          <Input
            {...register('name')}
            id="input-entity-name"
            placeholder={`${t('common:example')} : Kemenkes RI`}
            maxLength={255}
            className="uppercase"
          />
          {errors?.name?.message && (
            <FormErrorMessage>
              {t(errors?.name?.message as TFormValidationKeys)}
            </FormErrorMessage>
          )}
        </FormControl>
        <div className="ui-grid ui-grid-cols-2 ui-gap-x-6">
          <FormControl>
            <FormLabel required>
              {t('entity:form.information.label.type')}
            </FormLabel>
            <ReactSelect
              {...register('type')}
              id="select-entity-type"
              placeholder={t('entity:form.information.placeholder.type')}
              options={typeOptions}
              onChange={(option: OptionType) => {
                setValue('type', option?.value)
                clearErrors('type')
              }}
              value={typeOptions?.find((x) => x.value === watch('type'))}
              isClearable
            />
            {errors?.type?.message && (
              <FormErrorMessage>
                {t(errors?.type?.message as TFormValidationKeys)}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl>
            <FormLabel required>Tag</FormLabel>
            <ReactSelect
              {...register('entity_tag_id')}
              id="select-entity-tag"
              placeholder={t('list.filter.tag.placeholder')}
              options={materialTagList}
              onChange={(option: OptionType) => {
                setValue('entity_tag_id', option?.value)
                clearErrors('entity_tag_id')
              }}
              value={materialTagList.find(
                (x) => x.value === watch('entity_tag_id')
              )}
            />
            {errors?.entity_tag_id?.message && (
              <FormErrorMessage>
                {t(errors?.entity_tag_id?.message as TFormValidationKeys)}
              </FormErrorMessage>
            )}
          </FormControl>
        </div>
        {/* <div className="ui-grid ui-grid-cols-2 ui-gap-x-6">
          <FormControl>
            <FormLabel>{t('entity:form.information.label.hc')}</FormLabel>
            <RadioGroup>
              <Radio
                {...register('is_puskesmas')}
                id="radio-is-puskesmas-yes"
                value={1}
                label={t('common:yes')}
              />
              <Radio
                {...register('is_puskesmas')}
                id="radio-is-puskesmas-no"
                value={0}
                label={t('common:no')}
              />
            </RadioGroup>
          </FormControl>
          <FormControl>
            <FormLabel>{t('entity:form.information.label.asik')}</FormLabel>
            <RadioGroup>
              <Radio
                {...register('is_ayosehat')}
                id="radio-is-ayosehat-yes"
                value={1}
                label={t('common:yes')}
              />
              <Radio
                {...register('is_ayosehat')}
                id="radio-is-ayosehat-no"
                value={0}
                label={t('common:no')}
              />
            </RadioGroup>
          </FormControl>
        </div> */}
      </div>
    </div>
  )
}

export default EntityFormInformation
