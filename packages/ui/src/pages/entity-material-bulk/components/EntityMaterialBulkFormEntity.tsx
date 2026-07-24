import { useQueries } from '@tanstack/react-query'
import { FormControl, FormLabel } from '#components/form-control'
import { Input } from '#components/input'
import { CommonPlaceSelector } from '#components/modules/CommonPlaceSelector'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { useDebounce } from '#hooks/useDebounce'
import {
  getEntityType,
  GetEntityTypeResponse,
  listEntities,
  loadEntityTags,
} from '#services/entity'
import { clearField } from '#utils/form'
import { getReactSelectValue } from '#utils/react-select'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as yup from 'yup'

import { formSchema } from '../schema/EntityMaterialBulkSchemaForm'

type FilterFormData = yup.InferType<typeof formSchema>

const paramsFilter = { page: 1, paginate: 50 }

const EntityMaterialBulkFormEntity = () => {
  const { register, watch, setValue, control } =
    useFormContext<FilterFormData>()
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'entityMaterialBulk'])
  const {
    keyword_entity,
    type_ids,
    entity_tag_ids,
    province,
    province_ids,
    regency,
    regency_ids,
    sub_district,
    sub_district_ids,
    village_ids,
  } = watch()
  const debouncedKeyword = useDebounce(keyword_entity, 300)

  const [typeOptions, entityDatasource] = useQueries({
    queries: [
      {
        queryKey: ['typeOptions'],
        queryFn: () => getEntityType(paramsFilter),
        select: (res: GetEntityTypeResponse) =>
          res.data.map((x) => ({ value: x.id, label: x.name })),
        retry: false,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: [
          'entities',
          debouncedKeyword,
          type_ids,
          entity_tag_ids,
          province_ids,
          regency_ids,
          sub_district_ids,
          village_ids,
        ],
        queryFn: () =>
          listEntities({
            page: 1,
            paginate: 10,
            ...(debouncedKeyword && { keyword: debouncedKeyword }),
            ...(type_ids && { type_ids }),
            ...(entity_tag_ids && { entity_tag_ids }),
            ...(province_ids && { province_ids }),
            ...(regency_ids && { regency_ids }),
            ...(sub_district_ids && { sub_district_ids }),
            ...(village_ids && { village_ids }),
            is_vendor: 1,
          }),
        retry: false,
        refetchOnWindowFocus: false,
      },
    ],
  })

  return (
    <div className="ui-grid ui-grid-cols-1 ui-gap-x-4 ui-gap-y-4">
      <h6 className="ui-text-base ui-font-bold">
        {t('entityMaterialBulk:export.form.title.entity')}
      </h6>
      <FormControl>
        <FormLabel>
          {t('entityMaterialBulk:export.form.label.entity')}
        </FormLabel>
        <Input
          {...register('keyword_entity')}
          id="input-entity-search"
          placeholder={t('entityMaterialBulk:export.form.placeholder.entity')}
        />
      </FormControl>
      <div className="ui-grid ui-grid-cols-2 ui-gap-x-4">
        <FormControl>
          <FormLabel>
            {t('entityMaterialBulk:export.form.label.entity_type')}
          </FormLabel>
          <ReactSelect
            {...register('type_ids')}
            id="select-entity-type"
            placeholder={t(
              'entityMaterialBulk:export.form.placeholder.entity_type'
            )}
            options={typeOptions.data}
            value={
              typeOptions.data?.filter((x) =>
                type_ids?.split(',').includes(String(x.value))
              ) || []
            }
            onChange={(option: OptionType[]) =>
              setValue('type_ids', option?.map((x) => x.value).join(','))
            }
            isClearable
            isMulti
            multiSelectCounterStyle="card"
          />
        </FormControl>
        <Controller
          name="entity_tag_ids"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <FormControl>
              <FormLabel>
                {t('entityMaterialBulk:export.form.label.entity_tag')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-entity-tag"
                loadOptions={loadEntityTags}
                debounceTimeout={300}
                isClearable
                isMulti
                placeholder={t(
                  'entityMaterialBulk:export.form.placeholder.entity_tag'
                )}
                additional={{
                  page: 1,
                  lang: language,
                  isGlobal: false,
                }}
                onChange={(option: OptionType[]) => {
                  onChange(option)
                  setValue(
                    'entity_tag_ids',
                    option.map((x) => x.value).join(',')
                  )
                }}
                menuPosition="fixed"
                multiSelectCounterStyle="card"
              />
            </FormControl>
          )}
        />
      </div>
      <div className="ui-grid ui-grid-cols-2 ui-gap-x-4">
        <Controller
          name="province"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <FormControl>
              <FormLabel>{t('common:form.province.label')}</FormLabel>
              <CommonPlaceSelector
                {...field}
                id="select-province"
                level="province"
                isClearable
                isMulti
                value={value || null}
                additional={{
                  page: 1,
                }}
                placeholder={t(
                  'entityMaterialBulk:export.form.placeholder.province'
                )}
                onChange={(value: OptionType[]) => {
                  onChange(value)
                  const temp = value.map((x) => String(x.value)).join(',')
                  setValue('province_ids', temp)
                  clearField({
                    setValue,
                    name: [
                      'regency',
                      'regency_ids',
                      'sub_district',
                      'sub_district_ids',
                      'village',
                      'village_ids',
                    ],
                  })
                }}
                menuPosition="fixed"
                multiSelectCounterStyle="card"
              />
            </FormControl>
          )}
        />
        <Controller
          name="regency"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <FormControl>
              <FormLabel>
                {t('entityMaterialBulk:export.form.label.city')}
              </FormLabel>
              <CommonPlaceSelector
                {...field}
                id="select-regency"
                level="regency"
                isClearable
                isMulti
                value={value || null}
                disabled={!province}
                additional={{
                  page: 1,
                  ...(province && {
                    parent_id: getReactSelectValue(province as OptionType[]),
                  }),
                }}
                placeholder={t(
                  'entityMaterialBulk:export.form.placeholder.regency'
                )}
                onChange={(value: OptionType[]) => {
                  onChange(value)
                  const temp = value.map((x) => String(x.value)).join(',')
                  setValue('regency_ids', temp)
                  clearField({
                    setValue,
                    name: [
                      'sub_district',
                      'sub_district_ids',
                      'village',
                      'village_ids',
                    ],
                  })
                }}
                menuPosition="fixed"
                multiSelectCounterStyle="card"
              />
            </FormControl>
          )}
        />
      </div>
      <div className="ui-grid ui-grid-cols-2 ui-gap-x-4">
        <Controller
          name="sub_district"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <FormControl>
              <FormLabel>{t('common:form.subdistrict.label')}</FormLabel>
              <CommonPlaceSelector
                {...field}
                id="select-sub-district"
                level="subdistrict"
                isClearable
                isMulti
                value={value || null}
                disabled={!regency}
                additional={{
                  page: 1,
                  ...(regency && {
                    parent_id: getReactSelectValue(regency as OptionType[]),
                  }),
                }}
                placeholder={t(
                  'entityMaterialBulk:export.form.placeholder.subdistrict'
                )}
                onChange={(value: OptionType[]) => {
                  onChange(value)
                  const temp = value.map((x) => String(x.value)).join(',')
                  setValue('sub_district_ids', temp)
                  clearField({
                    setValue,
                    name: ['village', 'village_ids'],
                  })
                }}
                menuPosition="fixed"
                multiSelectCounterStyle="card"
              />
            </FormControl>
          )}
        />
        <Controller
          name="village"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <FormControl>
              <FormLabel>{t('common:form.village.label')}</FormLabel>
              <CommonPlaceSelector
                {...field}
                id="select-village"
                level="village"
                isClearable
                isMulti
                value={value || null}
                disabled={!sub_district}
                additional={{
                  page: 1,
                  parent_id: getReactSelectValue(sub_district as OptionType[]),
                }}
                placeholder={t(
                  'entityMaterialBulk:export.form.placeholder.village'
                )}
                onChange={(value: OptionType[]) => {
                  onChange(value)
                  const temp = value.map((x) => String(x.value)).join(',')
                  setValue('village_ids', temp)
                }}
                menuPosition="fixed"
                multiSelectCounterStyle="card"
              />
            </FormControl>
          )}
        />
      </div>
      <div className="ui-bg-gray-100 ui-py-[2px] ui-px-[10px] ui-rounded-2xl ui-w-max">
        <p className="ui-text-gray-700 ui-text-sm ui-font-medium">
          {t('entityMaterialBulk:export.form.result.entity')}
          <span className="ui-ml-1 ui-text-xs ui-font-medium ui-bg-gray-700 ui-rounded-[100px] ui-text-white ui-py-[2px] ui-px-2">
            {entityDatasource.data?.total_item ?? 0}
          </span>
        </p>
      </div>
    </div>
  )
}

export default EntityMaterialBulkFormEntity
