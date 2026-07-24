import React, { useMemo } from 'react'
import ActiveLabel from '#components/modules/ActiveLabel'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { STATUS } from '#constants/common'
import { KfaLevelEnum, MATERIAL_HIERARCHY } from '#constants/material'
import { userRoleList } from '#constants/roles'
import {
  MaterialActivity,
  MaterialDetailProgramResponse,
} from '#services/material'
import { numberFormatter } from '#utils/formatter'
import { getProgramStorage } from '#utils/storage/program'
import { formatToCelcius } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { MaterialKfaCard } from './MaterialKfaCard'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

type MaterialDetailInfoProgramProps = {
  data: MaterialDetailProgramResponse
}

const MaterialDetailInfoProgram: React.FC<MaterialDetailInfoProgramProps> = ({
  data,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'material'])
  const isHierarchical =
    getProgramStorage()?.config?.material?.is_hierarchy_enabled
  const isShowGlobalMaterialSubtype = useFeatureIsOn('annual_planning.global_material_subtype')

  const mapMaterialHierarchy = (level: string) => {
    const material = data.material_hierarchy?.find(
      (item) => item.name === level
    )?.materials?.[0]

    const materialName = material?.name || ''
    const materialHierarchyCode = material?.hierarchy_code
      ? `(${material.hierarchy_code})`
      : ''

    return `${materialName} ${materialHierarchyCode}`
  }

  const currency = process.env.CURRENCY ?? 'IDR'

  const mapType = (
    response: MaterialDetailProgramResponse,
    mappingList: { label: string; value: any }[],
    type: 'roles' | 'entity_types'
  ) =>
    mappingList
      .filter((option) => response.addremove?.[type]?.includes(option.value))
      .map((option) => option.label)

  const generateDetailActivity = (materialActivity: MaterialActivity) => {
    const isPatientNeeded = materialActivity?.is_patient_needed === 1

    if (!isPatientNeeded) return materialActivity?.name
    return `${materialActivity?.name} (${t('material:form.activity.requires_patient_data')})`
  }

  const generateDetailTrademark = () => {
    const code = data?.code ? `(${data?.code})` : ''

    return `${data?.name} ${code}`
  }

  const isKFA93AndHaveHierarchy = useMemo(() => {
    return (
      data.material_level_id === KfaLevelEnum.KFA_93 && data.material_hierarchy
    )
  }, [data])

  const isKFA93AndHaveHierarchyCode = useMemo(() => {
    return (
      data.material_level_id === KfaLevelEnum.KFA_93 &&
      Boolean(data?.hierarchy_code)
    )
  }, [data])

  return (
    <div className="space-y-4">
      <ActiveLabel isActive={data.status === STATUS.ACTIVE} />

      {isKFA93AndHaveHierarchy && (
        <div className="ui-grid ui-grid-cols-4 ui-gap-2">
          <MaterialKfaCard
            label={t('material:detail.active_substance')}
            value={mapMaterialHierarchy(MATERIAL_HIERARCHY.INGREDIENT)}
          />
          <MaterialKfaCard
            label={t('material:detail.active_substance_and_strength')}
            value={mapMaterialHierarchy(MATERIAL_HIERARCHY.TEMPLATE)}
          />
          <MaterialKfaCard
            label={t('material:detail.trademark')}
            value={
              isKFA93AndHaveHierarchyCode
                ? generateDetailTrademark()
                : mapMaterialHierarchy(MATERIAL_HIERARCHY.VARIANT)
            }
          />
          <MaterialKfaCard
            label={t('material:detail.packaging')}
            value={mapMaterialHierarchy(MATERIAL_HIERARCHY.PACKAGING)}
          />
        </div>
      )}

      <RenderDetailValue
        data={[
          { label: t('material:detail.name'), value: data.name },
          {
            label: t('material:detail.level'),
            value: data?.material_level?.name,
          },
          {
            label: t('material:detail.description'),
            value: data.description,
          },
          {
            label:
              data?.material_level_id === KfaLevelEnum.KFA_93
                ? t('material:detail.kfa_93_code')
                : t('material:detail.kfa_92_code'),
            value: data.hierarchy_code,
            hidden: !isHierarchical,
          },
          { label: t('material:detail.code'), value: data.code },
          {
            label: t('material:detail.unit.consumption'),
            value: data.unit_of_consumption,
          },
          {
            label: t('material:detail.unit.distribution'),
            value: data.unit_of_distribution,
          },
          {
            label: t('material:detail.unit.distribution_pieces'),
            value: data.consumption_unit_per_distribution_unit,
          },
          {
            label: `${t('material:detail.retail.price_min')} (${currency})`,
            value: numberFormatter(data.min_retail_price, language),
          },
          {
            label: `${t('material:detail.retail.price_max')} (${currency})`,
            value: numberFormatter(data.max_retail_price, language),
          },
          {
            label: t('material:detail.temperature.sensitive'),
            value: data.is_temperature_sensitive
              ? t('common:yes')
              : t('common:no'),
          },
          {
            label: t('material:detail.temperature.min'),
            value: formatToCelcius(data.min_temperature),
          },
          {
            label: t('material:detail.temperature.max'),
            value: formatToCelcius(data.max_temperature),
          },
          {
            label: t('material:detail.material.type'),
            value: data.material_type?.name,
          },
          ...(isShowGlobalMaterialSubtype ? [{
            label: t('material:detail.material.subtype'),
            value: data.material_subtype?.name,
          }] : []),
          {
            label: `${t('material:detail.batch')}?`,
            value: data.is_managed_in_batch ? t('common:yes') : t('common:no'),
          },
          {
            label: t('material:detail.so_required'),
            value: data.is_stock_opname_mandatory
              ? t('common:yes')
              : t('common:no'),
          },
          {
            label: t('material:detail.manufactured'),
            value: data.manufactures?.map((manufacture) => manufacture.name),
          },
          {
            label: t('material:detail.material.companion'),
            value: data.material_companion?.map((companion) => companion.name),
          },
          {
            label: t('material:detail.activity'),
            value: data.material_activities?.map(generateDetailActivity),
          },
          {
            label: t('material:detail.stock.adjust'),
            value: data.is_addremove ? t('common:yes') : t('common:no'),
            hidden: data?.material_level_id === KfaLevelEnum.KFA_92,
          },
          {
            label: t('material:detail.stock.entity'),
            value: data?.addremove?.entity_types
              ?.map((data) => data?.name)
              .join(','),
            hidden: mapType(data, userRoleList, 'roles').length === 0,
          },
          {
            label: t('material:detail.stock.role'),
            value: mapType(data, userRoleList, 'roles'),
            hidden: mapType(data, userRoleList, 'roles').length === 0,
          },
        ]}
      />
    </div>
  )
}

export default MaterialDetailInfoProgram
