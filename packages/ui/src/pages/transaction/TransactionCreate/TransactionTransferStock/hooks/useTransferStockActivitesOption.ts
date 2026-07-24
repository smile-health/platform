import { useQuery } from '@tanstack/react-query'
import { TDetailActivityDate } from '#types/entity'
import { listTransferStockActivities } from '../transaction-transfer-stock.services'
import { OptionType } from '#components/react-select'

export default function useTransferStockActivitesOption(
  destination_id: number | undefined | null,
  material_id: number | undefined | null,
  entity_id: OptionType | null
) {
  const { data } = useQuery({
    queryFn: () =>
      listTransferStockActivities({
        destination_program_id: destination_id,
        material_id: material_id,
        entity_id: entity_id?.value,
      }),
    queryKey: [
      'transaction-transfer-stock-activities',
      destination_id,
      material_id,
      entity_id?.value,
    ],
    enabled: !!destination_id && !!material_id && !!entity_id?.value,
    select: (res) => {
      const typeData = res?.map((type: TDetailActivityDate) => ({
        label: type?.name,
        value: type?.id
      }))

      return typeData
    },
  })

  return data || []
}
