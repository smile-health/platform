import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { ReactSelectAsync } from '#components/react-select'
import { loadManufacturers } from '#services/manufacturer'
import { loadMaterial } from '#services/material'
import { CreateMaterialVolumeInput } from '#services/material-volume'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const MaterialVolumeFormDetail = () => {
  const { t } = useTranslation('materialVolume')
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateMaterialVolumeInput>()

  const { consumption_unit_per_distribution_unit } = watch()

  return (
    <div className="ui-p-4 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold ui-text-primary ui-text-dark-blue">
        {t('detail.section.detail.header')}
      </div>
      <div className="ui-grid ui-grid-cols-2 ui-gap-5">
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="material_id" required>
            {t('form.material.label')}
          </FormLabel>
          <Controller
            name="material_id"
            control={control}
            render={({
              field: { onChange, ...field },
              fieldState: { error },
            }) => (
              <ReactSelectAsync
                {...field}
                id="material_id"
                isClearable
                disabled={false}
                loadOptions={(keyword, _, additional) =>
                  loadMaterial(keyword, _, additional) as any
                }
                onChange={(selected: {
                  value: string | number
                  label: string
                  consumption_unit_per_distribution_unit?: number
                }) => {
                  onChange(selected)
                  setValue(
                    'consumption_unit_per_distribution_unit',
                    selected?.consumption_unit_per_distribution_unit
                  )
                }}
                placeholder={t('form.material.placeholder')}
                additional={{
                  page: 1,
                  is_with_consumption_per_distribution_unit: true,
                  material_level_ids: '3',
                }}
                error={!!error?.message}
              />
            )}
          />
          {errors?.material_id?.message && (
            <FormErrorMessage>{errors?.material_id?.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="manufacturer_id" required>
            {t('form.manufacturer.label')}
          </FormLabel>
          <Controller
            name="manufacture_id"
            control={control}
            render={({
              field: { onChange, ...field },
              fieldState: { error },
            }) => (
              <ReactSelectAsync
                {...field}
                id="manufacturer_id"
                isClearable
                disabled={false}
                loadOptions={(keyword, _, additional: { page: number }) =>
                  loadManufacturers(keyword, _, {
                    ...additional,
                    page: additional?.page ?? 1,
                  }) as any
                }
                placeholder={t('form.manufacturer.placeholder')}
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
          {errors?.manufacture_id?.message && (
            <FormErrorMessage>
              {errors?.manufacture_id?.message}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="consumption_unit_per_distribution_unit">
            {t('form.pieces_per_unit.label')}
          </FormLabel>
          <Controller
            name="consumption_unit_per_distribution_unit"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputNumberV2
                {...field}
                disabled
                id="consumption_unit_per_distribution_unit"
                name="consumption_unit_per_distribution_unit"
                placeholder={t('form.pieces_per_unit.placeholder')}
                value={consumption_unit_per_distribution_unit ?? ''}
                error={!!error?.message}
              />
            )}
          />
          {errors?.consumption_unit_per_distribution_unit?.message && (
            <FormErrorMessage>
              {typeof errors?.consumption_unit_per_distribution_unit
                ?.message === 'string' &&
                errors?.consumption_unit_per_distribution_unit?.message}
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl className="ui-w-full">
          <FormLabel htmlFor="unit_per_box" required>
            {t('form.unit_per_box.label')}
          </FormLabel>
          <Controller
            name="unit_per_box"
            control={control}
            render={({ fieldState: { error }, field: { onChange } }) => (
              <InputNumberV2
                id="unit_per_box"
                name="unit_per_box"
                placeholder={t('form.unit_per_box.placeholder')}
                value={watch('unit_per_box') ?? ''}
                onValueChange={(value) => {
                  onChange(value?.floatValue)
                }}
                error={!!error?.message}
              />
            )}
          />
          {errors?.unit_per_box?.message && (
            <FormErrorMessage>
              {typeof errors?.unit_per_box?.message === 'string' &&
                errors?.unit_per_box?.message}
            </FormErrorMessage>
          )}
        </FormControl>
      </div>
    </div>
  )
}

export default MaterialVolumeFormDetail
