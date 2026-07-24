import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Controller, useFormContext } from "react-hook-form"
import * as yup from 'yup'

import { FormControl, FormLabel } from "#components/form-control"
import { Input } from "#components/input"
import { OptionType, ReactSelectAsync } from "#components/react-select"
import { formSchema } from "../schema/EntityMaterialBulkSchemaForm"
import { getMaterials, loadMaterialType } from "#services/material"
import { useDebounce } from "#hooks/useDebounce"
import { loadActivityOptions } from "#services/activity"
import { KfaLevelEnum } from "#constants/material"

type FilterFormData = yup.InferType<typeof formSchema>

type Props = { isMaterialHierarchy: boolean }

const EntityMaterialBulkFormMaterial: React.FC<Props> = ({ isMaterialHierarchy }) => {
  const { register, watch, setValue, control } = useFormContext<FilterFormData>()
  const { t } = useTranslation(['common', 'entityMaterialBulk'])

  const { material_type_ids, keyword_material, activity_id } = watch()

  const debouncedKeyword = useDebounce(keyword_material, 300)

  const { data: materialDatasource } = useQuery({
    queryKey: ['materials', material_type_ids, debouncedKeyword, activity_id],
    queryFn: () => getMaterials({
      page: 1,
      paginate: 10,
      ...debouncedKeyword && { keyword: debouncedKeyword },
      ...material_type_ids && { material_type_ids },
      ...activity_id && { activity_id },
      ...isMaterialHierarchy && { material_level_id: KfaLevelEnum.KFA_92 }
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })

  return (
    <div className="ui-grid ui-grid-cols-1 ui-gap-y-4">
      <h6 className="ui-text-base ui-font-bold">
        {t('entityMaterialBulk:export.form.title.material')}
      </h6>
      <div className="ui-grid ui-grid-cols-2 ui-gap-x-4 ui-gap-y-4">
        <FormControl>
          <FormLabel>{t('entityMaterialBulk:export.form.label.material')}</FormLabel>
          <Input
            {...register('keyword_material')}
            id="input-entity-search"
            placeholder={t('entityMaterialBulk:export.form.placeholder.material')}
          />
        </FormControl>
        <Controller
          name="material_type_ids"
          control={control}
          render={({
            field: { onChange, value, ...field },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-material-material-type-unit">
                {t('entityMaterialBulk:export.form.label.material_type')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-material-material-type-unit"
                loadOptions={loadMaterialType}
                debounceTimeout={300}
                isClearable
                isMulti
                placeholder={t('entityMaterialBulk:export.form.placeholder.material_type')}
                additional={{
                  page: 1,
                }}
                onChange={(option: OptionType[]) => {
                  onChange(option)
                  setValue('material_type_ids', option.map(x => x.value).join(','))
                }}
                menuPosition="fixed"
                multiSelectCounterStyle='card'
              />
            </FormControl>
          )}
        />
      </div>
      <div className="ui-grid ui-grid-cols-1 ui-gap-y-4">
        <Controller
          name="activity_id"
          control={control}
          render={({
            field: { onChange, value, ...field },
          }) => (
            <FormControl>
              <FormLabel htmlFor="select-material-activity">
                {t('entityMaterialBulk:export.form.label.activity')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-material-activity"
                loadOptions={loadActivityOptions}
                debounceTimeout={300}
                isClearable
                placeholder={t('entityMaterialBulk:export.form.placeholder.activity')}
                additional={{
                  page: 1,
                }}
                onChange={(option: OptionType) => {
                  onChange(option)
                  setValue('activity_id', option.value)
                }}
                menuPosition="fixed"
                multiSelectCounterStyle="card"
                menuPlacement="top"
              />
            </FormControl>
          )}
        />
      </div>
      <div className="ui-bg-gray-100 ui-py-[2px] ui-px-[10px] ui-rounded-2xl ui-w-max">
        <p className="ui-text-gray-700 ui-text-sm ui-font-medium">
          {t('entityMaterialBulk:export.form.result.material')}
          <span className="ui-ml-1 ui-text-xs ui-font-medium ui-bg-gray-700 ui-rounded-[100px] ui-text-white ui-py-[2px] ui-px-2">
            {materialDatasource?.total_item || 0}
          </span>
        </p>
      </div>
      <div className="ui-border-b-[1px]" />
    </div>
  )
}

export default EntityMaterialBulkFormMaterial