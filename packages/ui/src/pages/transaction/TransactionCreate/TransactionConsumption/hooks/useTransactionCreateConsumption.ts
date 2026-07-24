import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { DetailStock, Stock } from '#types/stock'
import { AxiosError } from 'axios'
import { useFormContext } from 'react-hook-form'

import { listStockDetailStock } from '../../transaction-create.service'
import { CreateTransactionConsumption, ListVaccineSequenceByProtocolResponse } from '../transaction-consumption.type'
import { setIntialBatch } from '../utils/helpers'
import { useTransactionCreateConsumptionSetDataPatientId } from './useTransactionCreateConsumptionSetDataPatientId'
import { getListVaccineSequenceByProtocol } from '../transaction-consumption.service'
import { useDataVaccineSequenceByProtocol } from '../store/consumption-detail.store'

export const TransactionCreateConsumpution = () => {
  const { watch, setValue } = useFormContext<CreateTransactionConsumption>()
  const { items, entity, transactionType, activity, is_open_vial_customer } =
    watch()
  const { setLoadingPopup } = useLoadingPopupStore()
  const { groupPatientIdByNik } =
    useTransactionCreateConsumptionSetDataPatientId()
  const { setDataSequence } = useDataVaccineSequenceByProtocol()

  const handleFetchVaccineSequence = async (protocolId: number): Promise<ListVaccineSequenceByProtocolResponse | null> => {
    try {
      const response = await getListVaccineSequenceByProtocol(protocolId)
      setDataSequence(response, protocolId)
      return response ?? null
    } catch (error) {
      console.error(error)

      return null
    }
  }

  const handleAddItemConsumption = async ({ item }: { item: Stock }) => {
    setLoadingPopup(true)
    try {
      if (items?.some(({ material_id }) => material_id === item.material?.id))
        return

      const { data } = await listStockDetailStock({
        group_by: 'activity',
        entity_id: entity?.value,
        material_id: item.material?.id,
        only_have_qty: 1,
      })
      if (data?.length === 0) return
      const [currentActivity, materialItemNonActivity] = data.reduce<
        [DetailStock[], DetailStock[]]
      >(
        ([current, nonCurrent], stock) => {
          stock.activity?.id === activity?.value
            ? current.push(stock)
            : nonCurrent.push(stock)
          return [current, nonCurrent]
        },
        [[], []]
      )

      // fetching data sequence
      let responseVaccineSequence: ListVaccineSequenceByProtocolResponse | null = null
      if (item.protocol?.protocol_id) responseVaccineSequence = await handleFetchVaccineSequence(item.protocol?.protocol_id)

      const managed_in_batch = item.material?.is_managed_in_batch
      const isOpenVial = Boolean(item.material?.is_open_vial && is_open_vial_customer)

      const createStockEntry = (
        stockItem: DetailStock | null,
        stockId: number | null
      ) => ({
        material_id: item.material?.id,
        material_name: item.material?.name,
        available_stock: stockItem?.total_available_qty ?? 0,
        on_hand_stock: stockItem?.total_qty ?? 0,
        min: stockItem?.min,
        max: stockItem?.max,
        managed_in_batch,
        transaction_type_id: transactionType?.value,
        is_open_vial: isOpenVial,
        temperature_sensitive: item.material?.is_temperature_sensitive,
        pieces_per_unit: item.material?.consumption_unit_per_distribution_unit,
        stock_id: stockId,
        unit: item.material?.unit_of_consumption,
        is_vaccine: item?.protocol?.is_patient_needed,
        is_need_sequence: item?.protocol?.protocol_id ? 1 : 0,
        is_medical_history: responseVaccineSequence?.is_medical_history,
        is_kipi: responseVaccineSequence?.is_kipi, // alternate for access kipi in parent item when add new batch
        batches: setIntialBatch({
          obj: stockItem,
          materialItemList: stockItem?.stocks || [],
          selectedItem: item,
          isOpenVialCustomer: isOpenVial,
          isKipi: responseVaccineSequence?.is_kipi, // initial isKipi Batch
        }),
        batchNonActivity: materialItemNonActivity,
        protocol_id: item.protocol?.protocol_id,
      })

      const inComingStock = currentActivity.length
        ? currentActivity.map((stock) =>
          createStockEntry(stock, Number(stock.stocks?.[0]?.id) || null)
        )
        : [createStockEntry(null, null)]

      setValue('items', [...(items || []), ...inComingStock])
    } catch (error) {
      if (error instanceof AxiosError) {
        const { message } = error.response?.data as { message: string }

        toast.danger({ description: message })
      }
    } finally {
      setLoadingPopup(false)
    }
  }

  const handleDeleteItemConsumption = (index: number) => {
    const copyItems = [...items]
    if (index > -1) {
      // only splice array when item is found
      copyItems.splice(index, 1) // 2nd parameter means remove one item only
      setValue('items', copyItems)
      groupPatientIdByNik(copyItems)
    }
  }
  const handleRemoveMaterialConsumption = ({ item }: { item: Stock }) => {
    const index = items?.findIndex((i) => i.material_id === item.material?.id)
    if (index > -1) handleDeleteItemConsumption(index)
    return false
  }

  return {
    handleAddItemConsumption,
    handleDeleteItemConsumption,
    handleRemoveMaterialConsumption,
  }
}
