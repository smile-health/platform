import { Controller, useFormContext } from "react-hook-form"
import { FormControl, FormErrorMessage, FormLabel } from "#components/form-control"
import { ReactSelectAsync } from "#components/react-select"
import { useTranslation } from "react-i18next"
import { loadActivityOptions } from "#services/activity"
import { Button } from "#components/button"
import Reload from "#components/icons/Reload"
import { loadEntities } from "#services/entity"
import { ENTITY_TAG, ENTITY_TYPE } from "#constants/entity"
import { KfaLevelEnum } from "#constants/material"
import { getProgramStorage } from "#utils/storage/program"
import { loadMaterial } from "../annual-planning-process.services"
import { FormCalculationResultFilterForm } from "../annual-planning-process.types"
import Export from "#components/icons/Export"

type Props = {
  handleSearch: () => void
  handleReset: () => void
  handleOnChangeReset: () => void
  handleExport: () => void
  province_ids?: string
  regency_ids?: string
}

const FormCalculationResultFilter: React.FC<Props> = (props) => {
  const {
    handleReset,
    handleSearch,
    handleOnChangeReset,
    handleExport,
    province_ids,
    regency_ids
  } = props
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const {
    control,
  } = useFormContext<FormCalculationResultFilterForm>()
  const isHierarchical = getProgramStorage()?.config?.material?.is_hierarchy_enabled

  return (
    <div className="ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      <div className="ui-grid ui-grid-cols-3 ui-gap-4">
        <Controller
          control={control}
          name="activity"
          render={({
            field: { onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel required>
                {t('annualPlanningProcess:create.form.calculation_result.activity.label')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-activity"
                placeholder={t('annualPlanningProcess:create.form.calculation_result.activity.placeholder')}
                loadOptions={loadActivityOptions}
                additional={{
                  page: 1,
                }}
                onChange={(e) => {
                  onChange(e)
                  if (field.value?.value) handleOnChangeReset()
                }}
                menuPosition="fixed"
                isClearable
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="material"
          render={({
            field: { onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel required>
                {t('annualPlanningProcess:create.form.calculation_result.material.label')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-material"
                placeholder={t('annualPlanningProcess:create.form.calculation_result.material.label')}
                loadOptions={loadMaterial as any}
                additional={{
                  page: 1,
                  material_level_id: isHierarchical ? KfaLevelEnum.KFA_92 : KfaLevelEnum.KFA_93
                }}
                onChange={(e) => {
                  onChange(e)
                  if (field.value?.value) handleOnChangeReset()
                }}
                menuPosition="fixed"
                isClearable
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="entity"
          render={({
            field: { onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel>
                {t('annualPlanningProcess:create.form.calculation_result.health_care.label')}
              </FormLabel>
              <ReactSelectAsync
                {...field}
                id="select-entity"
                placeholder={t('annualPlanningProcess:create.form.calculation_result.health_care.label')}
                loadOptions={loadEntities}
                additional={{
                  page: 1,
                  type_ids: ENTITY_TYPE.FASKES,
                  entity_tag_ids: ENTITY_TAG.PUSKESMAS,
                  province_ids,
                  regency_ids,
                }}
                onChange={(e) => {
                  onChange(e)
                  if (field.value?.value) handleOnChangeReset()
                }}
                menuPosition="fixed"
                isClearable
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      </div>
      <div className="ui-flex ui-justify-end ui-items-center ui-gap-2">
        <Button
          id="btn-download-template"
          variant="subtle"
          type="button"
          className="ui-px-2"
          leftIcon={<Export className="ui-size-5" />}
          onClick={handleExport}
        >
          {t('common:export')}
        </Button>
        <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
        <Button
          id="btn-activity-refresh"
          data-testid="btn-activity-refresh"
          type="button"
          variant="subtle"
          onClick={handleReset}
          leftIcon={<Reload className="ui-size-5" />}
        >
          {t('common:reset')}
        </Button>
        <Button
          id="btn-activity-submit"
          data-testid="btn-activity-submit"
          type="submit"
          className="ui-w-[220px]"
          variant="outline"
          onClick={handleSearch}
        >
          {t('common:search')}
        </Button>
      </div>
    </div>
  )
}

export default FormCalculationResultFilter