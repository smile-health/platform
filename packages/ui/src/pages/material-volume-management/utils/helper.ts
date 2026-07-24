import { CreateMaterialVolumeInput } from '#services/material-volume'
import { MaterialVolumeDetail } from '#types/material-volume'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { getFullName } from '#utils/strings'
import { TFunction } from 'i18next'

export function handleDefaultValue(defaultValue?: CreateMaterialVolumeInput) {
  return {
    material_id: defaultValue?.material_id ? defaultValue?.material_id : null,
    manufacture_id: defaultValue?.manufacture_id
      ? defaultValue?.manufacture_id
      : null,
    box_length: defaultValue?.box_length ?? null,
    box_width: defaultValue?.box_width ?? null,
    box_height: defaultValue?.box_height ?? null,
    unit_per_box: defaultValue?.unit_per_box ?? null,
    consumption_unit_per_distribution_unit:
      defaultValue?.consumption_unit_per_distribution_unit ?? null,
  }
}

export function generateDetail(
  t: TFunction<'materialVolume'>,
  language: string,
  detail?: MaterialVolumeDetail
) {
  return [
    {
      label: t('detail.section.detail.label.material_name'),
      value: detail?.material?.name ?? '-',
    },
    {
      label: t('detail.section.detail.label.manufacturer'),
      value: detail?.manufacture?.name ?? '-',
    },
    {
      label: t('detail.section.detail.label.dose_per_unit'),
      value: detail?.box_length
        ? t('list.column.box_dimension.doses', {
            value: numberFormatter(
              detail?.material?.consumption_unit_per_distribution_unit,
              language
            ),
          })
        : '-',
    },
    {
      label: t('detail.section.detail.label.unit_per_box'),
      value: detail?.box_length
        ? t('list.column.box_dimension.unit', {
            value: numberFormatter(detail?.unit_per_box, language),
          })
        : '-',
    },
    {
      label: t('detail.section.detail.label.last_updated_at'),
      value:
        parseDateTime(detail?.updated_at, 'DD MMM YYYY HH:mm').toUpperCase() ??
        '-',
    },
    {
      label: t('detail.section.detail.label.last_updated_by'),
      value:
        getFullName(
          detail?.user_updated_by?.firstname,
          detail?.user_updated_by?.lastname
        ) ?? '-',
    },
  ]
}

export function generateDetailBoxDimension(
  t: TFunction<'materialVolume'>,
  detail?: MaterialVolumeDetail
) {
  return [
    {
      label: t('detail.section.box_dimension.label.length'),
      value: detail?.box_length
        ? t('list.column.box_dimension.cm', { value: detail?.box_length })
        : '-',
    },
    {
      label: t('detail.section.box_dimension.label.width'),
      value: detail?.box_width
        ? t('list.column.box_dimension.cm', { value: detail?.box_width })
        : '-',
    },
    {
      label: t('detail.section.box_dimension.label.height'),
      value: detail?.box_height
        ? t('list.column.box_dimension.cm', { value: detail?.box_height })
        : '-',
    },
  ]
}
