import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '#components/form-control'
import { Input } from '#components/input'
import { TextArea } from '#components/text-area'
import { MasterJenisPemeriksaanFormType } from '../../schema/MasterJenisPemeriksaanSchemaForm'

export default function MasterJenisPemeriksaanFormMainInfo() {
  const { t } = useTranslation() as any
  const {
    register,
    formState: { errors },
  } = useFormContext<MasterJenisPemeriksaanFormType>()

  return (
    <div className="ui-p-4 ui-pb-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded">
      <div className="ui-mb-5 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('master-jenis-pemeriksaan:form.section_title')}
      </div>

      <div className="ui-flex ui-flex-col ui-space-y-5">
        {/* Name Field */}
        <FormControl>
          <FormLabel htmlFor="name" required>
            {t('master-jenis-pemeriksaan:form.name.label')}
          </FormLabel>
          <Input
            id="name"
            placeholder={t('master-jenis-pemeriksaan:form.name.placeholder')}
            {...register('name')}
            error={!!errors?.name}
          />
          {errors?.name && (
            <FormErrorMessage>{errors.name.message}</FormErrorMessage>
          )}
        </FormControl>

        {/* Description Field */}
        <FormControl>
          <FormLabel htmlFor="description" required>
            {t('master-jenis-pemeriksaan:form.description.label')}
          </FormLabel>
          <TextArea
            id="description"
            placeholder={t(
              'master-jenis-pemeriksaan:form.description.placeholder'
            )}
            rows={4}
            {...register('description')}
          />
          {errors?.description && (
            <FormErrorMessage>{errors.description.message}</FormErrorMessage>
          )}
        </FormControl>
      </div>
    </div>
  )
}
