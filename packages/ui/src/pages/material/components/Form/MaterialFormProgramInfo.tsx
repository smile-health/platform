import React, { Fragment, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '#components/empty-state'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputSearch } from '#components/input'
import { Radio, RadioGroup } from '#components/radio'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { USER_ROLE, userRoleList } from '#constants/roles'
import { useProgram } from '#hooks/program/useProgram'
import { getFullActivities } from '#services/activity'
import { loadEntityTypes } from '#services/entity'
import { loadPlatformManufacturers } from '#services/manufacturer'
import { loadMaterial, MaterialDetailProgramResponse } from '#services/material'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MaterialProgramFormData } from '../../schema/MaterialSchemaForm'
import { DEFAULT_VALUE } from '../../utils/material.constants'
import ActivityItemWrapper from './ActivityItemWrapper'
import { MaterialFormProgramDetail } from './MaterialFormProgramDetail'
import { useTransactionBeneficiaryConfigFlag } from '#hooks/useTransactionBeneficiaryConfigFlag'
import { KfaLevelEnum } from '#constants/material'

type Props = {
  detailProgram?: MaterialDetailProgramResponse
}

const MaterialFormPrograms: React.FC<Props> = ({ detailProgram }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['material', 'common'])
  const { activeProgram } = useProgram()
  const {
    showMaterialActivityPatient
  } = useTransactionBeneficiaryConfigFlag()
  const isMaterialKfaLevel93 = detailProgram?.material_level_id === KfaLevelEnum.KFA_93

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
    control,
  } = useFormContext<MaterialProgramFormData>()

  const {
    is_addremove,
    manufactures,
    material_companion,
    entity_types,
    roles,
    activities,
  } = watch()

  const { data: listActivity } = useQuery({
    queryKey: ['activities', detailProgram?.id],
    queryFn: () => getFullActivities(),
    enabled: Boolean(detailProgram?.id),
  })
  const [keywordActivity, setKeywordActivity] = React.useState('')

  const filteredActivities = useMemo(
    () =>
      listActivity?.data.filter((activity) =>
        activity.name.toLowerCase().includes(keywordActivity.toLowerCase())
      ),
    [listActivity, keywordActivity]
  )

  function mapDataToLabel(
    list: { label: string; value: number }[],
    data?: number[]
  ) {
    return data
      ?.map((roleId) => {
        const datum = list.find((item) => item.value === roleId)
        if (datum) {
          return { label: datum.label, value: datum.value }
        }
        return null
      })
      .filter((item) => item !== null)
  }

  const handleSelectActivity = (activityId: number) => {
    const index = activities.findIndex((item) => item.value === activityId)
    if (index !== -1) activities.splice(index, 1)
    else {
      const activity = filteredActivities?.find(
        (item) => item.id === activityId
      )
      activities.push({
        value: activity?.id,
        label: activity?.name,
        isPatientNeeded: false,
      })
    }

    setValue('activities', activities)
  }

  const handleChangePatientNeeded = (activityId: number) => {
    const index = activities.findIndex((item) => item.value === activityId)
    const activity = activities[index]
    activities.splice(index, 1, {
      ...activity,
      isPatientNeeded: !activity?.isPatientNeeded,
    })
    setValue('activities', activities)
  }

  return (
    <div className="ui-flex ui-flex-col ui-">
      <MaterialFormProgramDetail detailProgram={detailProgram} />

      <div className="ui-p-4 ui-border ui-rounded">
        <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
          <Controller
            name="manufactures"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-manufacturer-material" required>
                    {t('material:form.manufacture.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    id="select-manufacturer-material"
                    loadOptions={loadPlatformManufacturers}
                    debounceTimeout={300}
                    defaultValue={manufactures}
                    isMulti
                    multiSelectOptionStyle="normal"
                    multiSelectCounterStyle="card"
                    isClearable
                    placeholder={t('form.manufacture.placeholder')}
                    additional={{
                      page: 1,
                      type: '1',
                    }}
                    onChange={(option: OptionType[]) => {
                      onChange(option)
                      setValue('manufactures', option)
                    }}
                    error={!!error?.message}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )
            }}
          />
          <Controller
            name="activities"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-manufacturer-material" required>
                    {t('material:form.activity.label')}
                  </FormLabel>
                  <InputSearch
                    placeholder={t('form.activity.placeholder')}
                    defaultValue={keywordActivity}
                    onChange={(e) => setKeywordActivity(e.target.value)}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                  <div className="ui-grid ui-grid-cols-1 ui-gap-2 ui-mt-4 ui-max-h-96 ui-overflow-auto">
                    {filteredActivities?.map((activity) => {
                      const activitySelected = activities.find(
                        (item) => item.value === activity.id
                      )

                      return (
                        <ActivityItemWrapper
                          key={activity?.id}
                          activity={activity}
                          isChecked={Boolean(activitySelected)}
                          isPatientNeeded={
                            activitySelected?.isPatientNeeded || false
                          }
                          onSelectActivity={handleSelectActivity}
                          onChangePatientNeeded={handleChangePatientNeeded}
                          showMaterialActivityPatient={showMaterialActivityPatient && isMaterialKfaLevel93}
                        />
                      )
                    })}

                    {filteredActivities?.length === 0 ? (
                      <EmptyState
                        title={t('common:message.empty.title')}
                        description={t('common:message.empty.description')}
                        withIcon
                        className="ui-h-[480px]"
                      />
                    ) : null}
                  </div>
                </FormControl>
              )
            }}
          />
          <Controller
            name="material_companion"
            control={control}
            render={({
              field: { onChange, value, ...field },
              fieldState: { error },
            }) => {
              return (
                <FormControl>
                  <FormLabel htmlFor="select-companion-material">
                    {t('form.companion_material.label')}
                  </FormLabel>
                  <ReactSelectAsync
                    {...field}
                    id="select-companion_material"
                    loadOptions={(keyword, _, additional) =>
                      loadMaterial(keyword, _, additional) as any
                    }
                    debounceTimeout={300}
                    defaultValue={material_companion || null}
                    isClearable
                    isMulti
                    multiSelectOptionStyle="normal"
                    multiSelectCounterStyle="card"
                    placeholder={t('form.companion_material.placeholder')}
                    additional={{
                      page: 1,
                      material_level_ids:
                        detailProgram?.material_level_id?.toString(),
                      program_id: activeProgram?.id,
                    }}
                    onChange={(option: OptionType[]) => {
                      onChange(option)
                      clearErrors('material_companion')
                    }}
                  />
                  {error?.message && (
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  )}
                </FormControl>
              )
            }}
          />
          {detailProgram?.material_level_id === 3 && (
            <Fragment>
              <FormControl>
                <FormLabel>
                  {t('material:form.add_remove_stock.label')}
                </FormLabel>
                <RadioGroup>
                  <Radio
                    {...register('is_addremove')}
                    id="radio-is-material-add-remove-stock"
                    value={DEFAULT_VALUE.YES}
                    checked={Number(is_addremove) === DEFAULT_VALUE.YES}
                    defaultChecked={Number(is_addremove) === DEFAULT_VALUE.YES}
                    label={t('common:yes')}
                  />
                  <Radio
                    {...register('is_addremove')}
                    id="radio-material-is-not-add-remove-stock"
                    value={DEFAULT_VALUE.NO}
                    checked={Number(is_addremove) === DEFAULT_VALUE.NO}
                    defaultChecked={Number(is_addremove) === DEFAULT_VALUE.NO}
                    label={t('common:no')}
                  />
                </RadioGroup>
              </FormControl>
              <Controller
                key={language}
                name="entity_types"
                control={control}
                render={({
                  field: { onChange, value, ...field },
                  fieldState: { error },
                }) => {
                  return (
                    <FormControl>
                      <FormLabel required>
                        {t('material:form.entity_type.label')}
                      </FormLabel>
                      <ReactSelectAsync
                        {...field}
                        id="select-entity-type"
                        loadOptions={loadEntityTypes}
                        key={language}
                        value={entity_types || null}
                        isClearable
                        isMulti
                        multiSelectOptionStyle="normal"
                        multiSelectCounterStyle="card"
                        placeholder={t('material:form.entity_type.placeholder')}
                        additional={{
                          page: 1,
                          isGlobal: false,
                        }}
                        onChange={(option: OptionType[]) => {
                          setValue('entity_types', option)
                          clearErrors('entity_types')
                        }}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )
                }}
              />
              <FormControl>
                <FormLabel required>{t('material:form.role.label')}</FormLabel>
                <ReactSelect
                  {...register('roles')}
                  id="select-material-type"
                  disabled={Number(watch('is_addremove')) === DEFAULT_VALUE.NO}
                  placeholder={t('material:form.role.placeholder')}
                  options={userRoleList.filter(
                    (item) =>
                      item.value < USER_ROLE.OPERATOR_COVID ||
                      item.value === USER_ROLE.MANUFACTURE
                  )}
                  onChange={(option: OptionType[]) => {
                    setValue(
                      'roles',
                      option.map((data) => data.value)
                    )
                    clearErrors('roles')
                  }}
                  isMulti
                  multiSelectOptionStyle="normal"
                  multiSelectCounterStyle="card"
                  defaultValue={mapDataToLabel(userRoleList, roles) || null}
                  isClearable
                />
                {errors?.roles?.message && (
                  <FormErrorMessage>{errors?.roles?.message}</FormErrorMessage>
                )}
              </FormControl>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  )
}

export default MaterialFormPrograms
