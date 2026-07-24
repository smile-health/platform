import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { listManufacturerType } from '../manufacturer.service'

export default function useManufacturerTypeOptions() {
  const { t, i18n: language } = useTranslation()

  const { data: manufacturerTypeOptions } = useQuery({
    queryFn: listManufacturerType,
    queryKey: ['manufacturer-type', language],
    select: (res) => {
      const typeData = res?.map((type) => ({
        label: type?.name,
        value: type?.id,
      }))

      return [
        {
          label: t('select_type'),
          value: null,
        },
        ...typeData,
      ]
    },
  })

  return manufacturerTypeOptions || []
}
