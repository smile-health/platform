import React from 'react'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { MaterialDetailProgramResponse } from '#services/material'
import { numberFormatter } from '#utils/formatter'
import { formatToCelcius } from '#utils/strings'
import { useTranslation } from 'react-i18next'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

type MaterialFormProgramDetailProps = {
  detailProgram?: MaterialDetailProgramResponse
}

const valueHandler = (value?: string | number) => {
  return value?.toString() ?? '-'
}

export const MaterialFormProgramDetail: React.FC<
  MaterialFormProgramDetailProps
> = ({ detailProgram }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'material'])
  const isShowGlobalMaterialSubtype = useFeatureIsOn('annual_planning.global_material_subtype')
  const currency = process.env.CURRENCY ?? 'IDR'

  return (
    <div className="ui-p-4 ui-mb-8 ui-border ui-rounded">
      <div className="ui-mb-4 ui-font-bold">
        {t('material:form.global_info')}
      </div>

      <RenderDetailValue
        labelsClassName="capitalize"
        data={[
          {
            label: t('material:detail.name'),
            value: valueHandler(detailProgram?.name),
          },
          {
            label: t('material:detail.level'),
            value: valueHandler(detailProgram?.material_type?.name),
          },
          {
            label: t('material:detail.description'),
            value: valueHandler(detailProgram?.description),
          },
          {
            label: t('material:detail.code'),
            value: valueHandler(detailProgram?.code),
          },
          {
            label: t('material:detail.unit.consumption'),
            value: valueHandler(detailProgram?.unit_of_consumption),
          },
          {
            label: t('material:detail.unit.distribution'),
            value: valueHandler(detailProgram?.unit_of_distribution),
          },
          {
            label: t('material:detail.unit.distribution_pieces'),
            value: valueHandler(
              detailProgram?.consumption_unit_per_distribution_unit
            ),
          },
          {
            label: `${t('material:detail.retail.price_min')} (${currency})`,
            value: valueHandler(
              numberFormatter(detailProgram?.min_retail_price, language)
            ),
          },
          {
            label: `${t('material:detail.retail.price_max')} (${currency})`,
            value: valueHandler(
              numberFormatter(detailProgram?.max_retail_price, language)
            ),
          },
          {
            label: t('material:detail.temperature.sensitive'),
            value: valueHandler(
              detailProgram?.is_temperature_sensitive
                ? t('common:yes')
                : t('common:no')
            ),
          },
          {
            label: t('material:detail.temperature.min'),
            value: formatToCelcius(
              valueHandler(detailProgram?.min_temperature)
            ),
          },
          {
            label: t('material:detail.temperature.max'),
            value: formatToCelcius(
              valueHandler(detailProgram?.max_temperature)
            ),
          },
          {
            label: t('material:detail.material.type'),
            value: valueHandler(detailProgram?.material_type?.name),
          },
          ...isShowGlobalMaterialSubtype ? [{
            label: t('material:detail.material.subtype'),
            value: valueHandler(detailProgram?.material_subtype?.name),
          }] : [],
          {
            label: `${t('material:detail.batch')}?`,
            value: valueHandler(
              detailProgram?.is_managed_in_batch
                ? t('common:yes')
                : t('common:no')
            ),
          },
          {
            label: `${t('material:detail.so_required')}`,
            value: valueHandler(
              detailProgram?.is_stock_opname_mandatory
                ? t('common:yes')
                : t('common:no')
            ),
          },
        ]}
      />
    </div>
  )
}
