import { Button } from "#components/button"
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton
} from "#components/filter"

import { Fragment, useContext } from "react"
import { useTranslation } from "react-i18next"
import { getReactSelectLabel, getReactSelectValue } from "#utils/react-select"
import { AnnualPlanningProcessListContext } from "../context/ContextProvider"
import { parseDateTime } from "#utils/date"
import { AnnualPlanningProcessStatus, MinMaxStatusProvinceRegency } from "../annual-planning-process.constants"

const AnnualPlanningProcessListMinMaxProvince: React.FC = () => {
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const {
    program_plan_year,
    province_id,
    datasourceProvince,
    filter,
    setPagination,
    activateMinMaxDistrict,
    setActivateMinMaxDistrict,
    setActivateMinMaxProvince,
    handleActivateMinMaxDistrict,
    provinceName,
  } = useContext(AnnualPlanningProcessListContext)
  const programPlanYearName = getReactSelectLabel(program_plan_year)

  const isActiveFilterMinMax = (!getReactSelectValue(province_id) && !getReactSelectValue(program_plan_year))
    || datasourceProvince?.data?.annual_needs?.length === 0
  const shouldDisableButtonMinMaxProvince = isActiveFilterMinMax
    || !datasourceProvince?.data?.province_entity.can_activated_province
    || !!datasourceProvince?.data?.province_entity.activated_province_date
    || datasourceProvince?.data?.province_entity.min_max_status_province === MinMaxStatusProvinceRegency.ACTIVE
  const shouldDisableButtonMinMaxDistrict = isActiveFilterMinMax
    || !datasourceProvince?.data?.annual_needs.some(annual => annual.status === AnnualPlanningProcessStatus.APPROVED && !annual.min_max_status)

  return (
    <Fragment>
      <FilterFormRoot collapsible onSubmit={filter.handleSubmit}>
        <FilterFormBody className="ui-grid-cols-3">
          {filter.renderField()}
        </FilterFormBody>
        <FilterFormFooter>
          <div />
          <div className="ui-flex ui-gap-2">
            <div className="ui-flex ui-gap-2">
              <FilterResetButton onClick={filter.reset} variant="subtle" />
              <FilterSubmitButton
                onClick={() => setPagination({ page: 1 })}
                className="ui-w-[220px]"
                variant="outline"
              />
            </div>
          </div>
        </FilterFormFooter>
        {filter.renderActiveFilter()}
      </FilterFormRoot>

      {!activateMinMaxDistrict.open ? (
        <div className="ui-p-4 ui-flex ui-justify-between ui-items-center ui-rounded ui-bg-neutral-100 ui-border ui-border-neutral-300">
          <div className="ui-space-y-2">
            <p className="ui-text-sm ui-font-bold ui-text-neutral-500">
              {t('annualPlanningProcess:list.min_max.status_activation')}
            </p>
            <p className="ui-text-sm ui-text-neutral-700">
              {t('annualPlanningProcess:list.min_max.status_min_max')}
              {' '}
              {programPlanYearName}
              {' '}
              {provinceName ?? '-'}
              {' '}:
              <span className="ui-ml-2 ui-font-bold">
                {
                  datasourceProvince?.data.province_entity.min_max_status_province === MinMaxStatusProvinceRegency.ACTIVE ?
                    parseDateTime(datasourceProvince?.data?.province_entity?.activated_province_date || '', 'DD MMM YYYY HH:mm').toUpperCase() :
                    t('annualPlanningProcess:list.min_max.not_yet_activated')
                }
              </span>
            </p>
          </div>
          <div className="ui-flex ui-gap-6">
            {/* section min max regency */}
            <p className="ui-text-sm ui-font-bold ui-text-primary-700">
              {t('annualPlanningProcess:list.min_max_level.district')}
              <span className="ui-ml-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActivateMinMaxDistrict({ open: true, ids: [] })}
                  disabled={shouldDisableButtonMinMaxDistrict}
                >
                  {t('annualPlanningProcess:list.activate')}
                </Button>
              </span>
            </p>

            {/* section min max province */}
            <p className="ui-text-sm ui-font-bold ui-text-primary-700">
              {t('annualPlanningProcess:list.min_max_level.province')}
              <span className="ui-ml-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActivateMinMaxProvince(true)}
                  disabled={shouldDisableButtonMinMaxProvince}
                >
                  {t('annualPlanningProcess:list.activate')}
                </Button>
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="ui-p-4 ui-bg-primary-50 ui-flex ui-justify-between ui-items-center ui-rounded ui-border-neutral-300">
          <div className="ui-space-y-2">
            <p className="ui-text-sm ui-font-bold ui-text-neutral-500">
              {t('annualPlanningProcess:list.min_max.district_min_max_activation')}
            </p>
            <p className="ui-text-sm ui-text-neutral-700">
              {t('annualPlanningProcess:list.min_max.item_selected', { value: activateMinMaxDistrict.ids.length })}
            </p>
          </div>
          <div className="ui-space-x-2">
            <Button
              type="button"
              variant="outline"
              className="ui-min-w-44"
              onClick={() => setActivateMinMaxDistrict({ open: false, ids: [] })}
            >
              {t('common:cancel')}
            </Button>
            <Button
              type="button"
              className="ui-min-w-44"
              onClick={() => handleActivateMinMaxDistrict()}
            >
              {t('annualPlanningProcess:list.min_max.activate_selected_item')}
            </Button>
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default AnnualPlanningProcessListMinMaxProvince