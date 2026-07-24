import { UseFilter, useFilter } from '#components/filter'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

export function masterTableFilter(t: TFunction<['common', 'masterBmhp']>) {
  return [
    {
      id: 'select-capacity-status',
      type: 'text',
      name: 'keyword',
      label: t('masterBmhp:label.search'),
      placeholder: t('masterBmhp:placeholder.search'),
      defaultValue: '',
    },
  ] satisfies UseFilter
}

export const useTableFilter = () => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const filter = useFilter(masterTableFilter(t))

  return { filter }
}
