import { useDataRabiesSequence } from '../TransactionConsumption/store/consumption-detail.store'
import { getListRabiesSequence } from '../TransactionConsumption/transaction-consumption.service'
import { ListRabiesSequenceResponse } from '../TransactionConsumption/transaction-consumption.type'

export const useGetRabiesSequences = () => {
  const { setDataRabies } = useDataRabiesSequence()
  const getDataRabiesSequence = async () => {
    try {
      const res: ListRabiesSequenceResponse = await getListRabiesSequence()
      setDataRabies(res)
    } catch (error) {
      console.error(error)
      setDataRabies([])
    }
  }

  return {
    getDataRabiesSequence,
  }
}
