import { ActivityData } from '#types/activity'
import i18next, { TFunction } from 'i18next'
import { getLocalizedStaticLabel } from '#utils/localized-name'

export const getProtocolName = (protocol?: string) => {
  let name = '-'
  if (protocol === 'default') name = 'Default'
  else if (protocol === 'rabies') name = 'Rabies'
  else if (protocol === 'dengue') name = 'Dengue'

  return name
}

export const generateDetail = (t: TFunction<'activity'>, detail?: ActivityData) => {
  return [
    {
      label: t('form.name.label'),
      value: detail?.name ?? '-',
    },
    {
      label: t('form.process.label'),
      value: `${detail?.is_ordered_sales ? getLocalizedStaticLabel('Bottom Up', i18next.language) : ''} ${detail?.is_ordered_sales && detail?.is_ordered_purchase ? ', ' : ''} ${detail?.is_ordered_purchase ? getLocalizedStaticLabel('Top Down', i18next.language) : ''}`,
    },
    {
      label: t('form.protocol.label'),
      value: getLocalizedStaticLabel(
        getProtocolName(detail?.protocol),
        i18next.language
      ),
    },
    {
      label: "Distribusi Akhir",
      value: detail?.is_final_distribution === 1 ? 'Ya' : 'Tidak'
    }
  ]
}
