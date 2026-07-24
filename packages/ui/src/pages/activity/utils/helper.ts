import { ProgramEnum } from '#constants/program'
import { ActivityData } from '#types/activity'
import { getProgramStorage } from '#utils/storage/program'
import { TFunction } from 'i18next'

export const getProtocolName = (protocol?: string) => {
  let name = '-'
  if (protocol === 'default') name = 'Default'
  else if (protocol === 'rabies') name = 'Rabies'
  else if (protocol === 'dengue') name = 'Dengue'

  return name
}

export const generateDetail = (t: TFunction<'activity'>, detail?: ActivityData) => {
  const isKesling = getProgramStorage()?.key === ProgramEnum.Kesling

  return [
    {
      label: t('form.name.label'),
      value: detail?.name ?? '-',
    },
    {
      label: t('form.process.label'),
      value: `${detail?.is_ordered_sales ? 'Bottom Up' : ''} ${detail?.is_ordered_sales && detail?.is_ordered_purchase ? ', ' : ''} ${detail?.is_ordered_purchase ? 'Top Down' : ''}`,
    },
    {
      label: t('form.protocol.label'),
      value: getProtocolName(detail?.protocol),
    },
    ...(isKesling
      ? [
        {
          label: t('form.environmental_parameter_categories.label'),
          value:
            (detail as any)?.environmental_parameter_categories
              ?.map((c: { id: number; name: string }) => c.name)
              .join(', ') || '-',
        },
      ]
      : []),
      {
        label: "Distribusi Akhir",
        value: detail?.is_final_distribution === 1 ? 'Ya' : 'Tidak'
      }
  ]
}
