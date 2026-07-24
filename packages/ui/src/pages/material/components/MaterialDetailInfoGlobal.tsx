import { useQuery } from '@tanstack/react-query'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { Skeleton } from '#components/skeleton'
import { KfaLevelEnum } from '#constants/material'
import {
  getMaterialDetailRelation,
  MaterialDetailGlobalResponse,
} from '#services/material'
import { numberFormatter } from '#utils/formatter'
import { formatToCelcius } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { MaterialKfaCard } from './MaterialKfaCard'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

type MaterialDetailInfoGlobalProps = {
  id: string | number
  data: MaterialDetailGlobalResponse
}

const MaterialDetailInfoGlobal = ({
  id,
  data,
}: MaterialDetailInfoGlobalProps) => {
  const isShowGlobalMaterialSubtype = useFeatureIsOn('annual_planning.global_material_subtype')

  const currency = process.env.CURRENCY ?? 'IDR'

  const isHierarchyEnabled = data.programs.some(
    (program) => program.config.material.is_hierarchy_enabled
  )

  const isKFA93 =
    Boolean(data.hierarchy_code) &&
    data.material_level_id === KfaLevelEnum.KFA_93

  const { data: relationData, isLoading: isRelationLoading } = useQuery({
    queryKey: ['material', id, 'relation'],
    queryFn: () => getMaterialDetailRelation(data.id),
    enabled: isHierarchyEnabled && isKFA93,
  })

  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'material'])

  return (
    <div className="space-y-4">
      {isHierarchyEnabled &&
        isKFA93 &&
        (!relationData || isRelationLoading) && (
          <div className="ui-grid ui-grid-cols-4 ui-gap-4">
            <Skeleton className="ui-h-32 ui-w-full" />
            <Skeleton className="ui-h-32 ui-w-full" />
            <Skeleton className="ui-h-32 ui-w-full" />
            <Skeleton className="ui-h-32 ui-w-full" />
          </div>
        )}

      {isHierarchyEnabled && relationData && !isRelationLoading && (
        <div className="ui-grid ui-grid-cols-4 ui-gap-2">
          {relationData.material_hierarchy.map((item) => {
            let label = ''
            let value = item.materials
              ?.map((material) => {
                const hierarchyCode = material.hierarchy_code
                  ? `(${material.hierarchy_code})`
                  : ''
                return `${material.name} ${hierarchyCode}`
              })
              .join(', ')

            if (item.id === KfaLevelEnum.KFA_91) {
              label = t('material:detail.active_substance')
            } else if (item.id === KfaLevelEnum.KFA_92) {
              label = t('material:detail.active_substance_and_strength')
              const hierarchyCode = data.hierarchy_code
                ? `(${data.hierarchy_code})`
                : ''
              value = value ?? `${data.name} ${hierarchyCode}`
            } else if (item.id === KfaLevelEnum.KFA_94) {
              label = t('material:detail.packaging')
            }

            return (
              <MaterialKfaCard
                key={item.id}
                label={label}
                value={value ?? '-'}
              />
            )
          })}
        </div>
      )}

      <RenderDetailValue
        data={[
          { label: t('material:detail.name'), value: data.name },
          {
            label: t('material:detail.level'),
            value: data?.material_level?.name,
            hidden: !isHierarchyEnabled,
          },
          { label: t('material:detail.description'), value: data.description },
          {
            label: t('material:detail.kfa_92_code'),
            value: data.hierarchy_code,
            hidden: data.material_level_id !== KfaLevelEnum.KFA_92,
          },
          {
            label: t('material:detail.kfa_93_code'),
            value: data.hierarchy_code,
            hidden: !isKFA93 || !isHierarchyEnabled,
          },
          {
            label: t('material:detail.code'),
            value: data.code,
          },
          {
            label: t('material:detail.unit.consumption'),
            value: data.unit_of_consumption?.name,
          },
          {
            label: t('material:detail.unit.distribution'),
            value: data.unit_of_distribution?.name,
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
          ...isShowGlobalMaterialSubtype ? [
            {
              label: t('material:detail.material.subtype'),
              value: data.material_subtype?.name,
            }
          ] : [],
          {
            label: t('material:detail.batch'),
            value: data.is_managed_in_batch ? t('common:yes') : t('common:no'),
          },
          {
            label: t('material:detail.so_required'),
            value: data.is_stock_opname_mandatory
              ? t('common:yes')
              : t('common:no'),
          },
        ]}
      />
    </div>
  )
}

export default MaterialDetailInfoGlobal
