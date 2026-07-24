import { useFilter } from '#components/filter'
import { useTranslation } from 'react-i18next'

import coldStorageCapacityFilterSchema from './ColdStorageCapacityFilter.schema'

export default function useColdStorageCapacityFilter() {
  const { t } = useTranslation(['common', 'coldStorageCapacity'])

  const filter = useFilter(coldStorageCapacityFilterSchema(t))

  return filter
}
