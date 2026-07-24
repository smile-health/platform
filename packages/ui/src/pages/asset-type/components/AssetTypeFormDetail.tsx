import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { TextArea } from '#components/text-area'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CreateAssetTypeBody } from '../asset-type.type'

const AssetTypeFormDetail = () => {
  const { t } = useTranslation('assetType')
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateAssetTypeBody>()

  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('form.title.detail')}
      </div>
      <div className="ui-flex ui-flex-col ui-space-y-5">
        <FormControl>
          <FormLabel required>{t('form.detail.label.name')}</FormLabel>
          <Input
            {...register('name')}
            id="input-asset-type-name"
            placeholder={t('form.detail.placeholder.name')}
          />
          {errors?.name?.message && (
            <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl>
          <FormLabel>{t('form.detail.label.description')}</FormLabel>
          <TextArea
            {...register('description')}
            id="input-asset-type-description"
            placeholder={t('form.detail.placeholder.description')}
          />
          {errors?.description?.message && (
            <FormErrorMessage>{errors?.description?.message}</FormErrorMessage>
          )}
        </FormControl>
      </div>
    </div>
  )
}

export default AssetTypeFormDetail
